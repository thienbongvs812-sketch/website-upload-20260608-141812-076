(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function reset() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                reset();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                reset();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                reset();
            });
        }

        show(0);
        play();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.textContent
        ].join(" "));
    }

    function initSearch() {
        var input = document.querySelector("[data-live-search]");
        var cards = selectAll("[data-search-card]");
        var empty = document.querySelector("[data-search-empty]");
        var chips = selectAll("[data-filter-chip]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var activeChip = "";

        if (input && query) {
            input.value = query;
        }

        function apply() {
            var term = normalize(input ? input.value : query);
            var visible = 0;
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchedTerm = !term || text.indexOf(term) !== -1;
                var matchedChip = !activeChip || text.indexOf(activeChip) !== -1;
                var matched = matchedTerm && matchedChip;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                if (activeChip === normalize(chip.getAttribute("data-filter-chip"))) {
                    activeChip = "";
                } else {
                    activeChip = normalize(chip.getAttribute("data-filter-chip"));
                    chip.classList.add("is-active");
                }
                apply();
            });
        });

        if (cards.length) {
            apply();
        }
    }

    function initLazySections() {
        var button = document.querySelector("[data-load-more]");
        if (!button) {
            return;
        }
        var cards = selectAll("[data-search-card]");
        var limit = Number(button.getAttribute("data-load-more")) || 48;
        var step = Number(button.getAttribute("data-load-step")) || 48;

        function refresh() {
            cards.forEach(function (card, index) {
                if (!card.dataset.hiddenByLoader) {
                    card.dataset.hiddenByLoader = "0";
                }
                if (index >= limit) {
                    card.style.display = "none";
                    card.dataset.hiddenByLoader = "1";
                } else if (card.dataset.hiddenByLoader === "1") {
                    card.style.display = "";
                    card.dataset.hiddenByLoader = "0";
                }
            });
            if (limit >= cards.length) {
                button.style.display = "none";
            }
        }

        button.addEventListener("click", function () {
            limit += step;
            refresh();
        });

        refresh();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initSearch();
        initLazySections();
    });
})();
