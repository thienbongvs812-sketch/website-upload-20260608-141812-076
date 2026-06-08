(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        start();
    }

    function setupCategoryFilter() {
        var input = document.querySelector(".category-filter");
        var grid = document.querySelector(".category-movie-grid");
        var empty = document.querySelector(".empty-state");
        if (!input || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-filter") || "").toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        });
    }

    function makeCard(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-poster\" href=\"" + escapeAttr(movie.url) + "\" aria-label=\"" + escapeAttr(movie.title) + "\">",
            "<img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>",
            "<span class=\"movie-score\">" + escapeHtml(movie.rating) + "</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
            "<h3><a href=\"" + escapeAttr(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function setupSearch() {
        var input = document.getElementById("searchInput");
        var results = document.getElementById("searchResults");
        var status = document.getElementById("searchStatus");
        if (!input || !results || !status || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = "";
                status.textContent = "输入关键词查找影片";
                return;
            }
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.oneLine,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 80);
            if (!list.length) {
                results.innerHTML = "";
                status.textContent = "暂无匹配内容";
                return;
            }
            status.textContent = "搜索结果";
            results.innerHTML = list.map(makeCard).join("");
        }
        input.form.addEventListener("submit", function (event) {
            event.preventDefault();
            var q = input.value.trim();
            var nextUrl = q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html";
            window.history.replaceState({}, "", nextUrl);
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    function setupPlayer() {
        var video = document.getElementById("moviePlayer");
        var button = document.getElementById("startPlayback");
        if (!video || !button) {
            return;
        }
        var config = window.__PLAYER__ || {};
        var url = video.getAttribute("data-url") || config.url;
        var started = false;
        function begin() {
            if (!url) {
                return;
            }
            button.classList.add("is-hidden");
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = url;
            video.play().catch(function () {});
        }
        button.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (!started) {
                begin();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCategoryFilter();
        setupSearch();
        setupPlayer();
    });
})();
