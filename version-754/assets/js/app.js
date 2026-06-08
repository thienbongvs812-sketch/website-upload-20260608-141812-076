(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (slides.length > 1) {
            restart();
        }
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    function initFilters() {
        var pages = selectAll("[data-filter-page]");
        pages.forEach(function (page) {
            var input = page.querySelector("[data-search-input]");
            var yearSelect = page.querySelector("[data-filter-year]");
            var categorySelect = page.querySelector("[data-filter-category]");
            var cards = selectAll("[data-card]", page);
            var empty = page.querySelector("[data-empty-state]");

            function apply() {
                var query = normalize(input ? input.value : "");
                var minYear = yearSelect && yearSelect.value ? parseInt(yearSelect.value, 10) : 0;
                var category = categorySelect ? categorySelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var cardYear = parseInt(card.getAttribute("data-year"), 10) || 0;
                    var cardCategory = card.getAttribute("data-category") || "";
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passYear = !minYear || cardYear >= minYear;
                    var passCategory = !category || cardCategory === category;
                    var show = passQuery && passYear && passCategory;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            if (categorySelect) {
                categorySelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    window.initStaticPlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var loaded = false;
        var hls = null;

        if (!video || !cover || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
