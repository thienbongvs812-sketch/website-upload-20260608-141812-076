(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-site-search]");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                var input = form.querySelector("input[name='q'], input[type='search']");
                var query = input ? input.value.trim() : "";

                if (!query) {
                    window.location.href = "./search.html";
                    return;
                }

                window.location.href = "./search.html?q=" + encodeURIComponent(query);
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });

            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                startAutoPlay();
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                startAutoPlay();
            });
        });

        slider.addEventListener("mouseenter", stopAutoPlay);
        slider.addEventListener("mouseleave", startAutoPlay);
        startAutoPlay();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFiltering() {
        var pages = document.querySelectorAll("[data-filter-page]");

        pages.forEach(function (toolbar) {
            var section = toolbar.closest(".listing-section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-filter-card]"));
            var queryInput = toolbar.querySelector("[data-filter-query]");
            var typeSelect = toolbar.querySelector("[data-filter-type]");
            var regionSelect = toolbar.querySelector("[data-filter-region]");
            var yearSelect = toolbar.querySelector("[data-filter-year]");
            var count = toolbar.querySelector("[data-visible-count]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (queryInput && initialQuery) {
                queryInput.value = initialQuery;
            }

            function applyFilters() {
                var query = normalize(queryInput ? queryInput.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var region = normalize(regionSelect ? regionSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));

                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
                    var matchesRegion = !region || normalize(card.getAttribute("data-region")) === region;
                    var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var shouldShow = matchesQuery && matchesType && matchesRegion && matchesYear;

                    card.style.display = shouldShow ? "" : "none";

                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [queryInput, typeSelect, regionSelect, yearSelect].forEach(function (element) {
                if (!element) {
                    return;
                }

                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            });

            applyFilters();
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-video-player]");

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-player-overlay]");
            var message = player.querySelector("[data-player-message]");
            var source = player.getAttribute("data-src");
            var started = false;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function startPlayback() {
                if (!video || !source) {
                    setMessage("当前影片播放源不可用。");
                    return;
                }

                if (started) {
                    video.play().catch(function () {});
                    return;
                }

                started = true;
                setMessage("正在加载播放源...");

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);

                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (overlay) {
                            overlay.classList.add("is-hidden");
                        }
                        setMessage("");
                        video.play().catch(function () {
                            setMessage("播放源已加载，请再次点击视频播放。");
                        });
                    });

                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放加载失败，请刷新页面或稍后再试。");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        if (overlay) {
                            overlay.classList.add("is-hidden");
                        }
                        setMessage("");
                        video.play().catch(function () {
                            setMessage("播放源已加载，请再次点击视频播放。");
                        });
                    }, { once: true });
                } else {
                    video.src = source;
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                    video.play().catch(function () {
                        setMessage("当前浏览器需要 HLS 支持，请更新浏览器或启用 HLS 播放。");
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", startPlayback);
            }

            player.addEventListener("click", function (event) {
                if (event.target === player) {
                    startPlayback();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupFiltering();
        setupPlayers();
    });
})();
