(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === activeIndex);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === activeIndex);
        });
    }

    if (slides.length) {
        showSlide(0);

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });

        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5000);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters(panel) {
        var scope = document.querySelector(panel.getAttribute("data-target") || "body");
        if (!scope) {
            scope = document;
        }

        var input = panel.querySelector("[data-filter-input]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var keyword = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var typeValue = normalize(type ? type.value : "");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
            var matchType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;

            card.hidden = !(matchKeyword && matchYear && matchType);
        });
    }

    panels.forEach(function (panel) {
        var controls = Array.prototype.slice.call(panel.querySelectorAll("input, select"));

        controls.forEach(function (control) {
            control.addEventListener("input", function () {
                applyFilters(panel);
            });

            control.addEventListener("change", function () {
                applyFilters(panel);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        var input = panel.querySelector("[data-filter-input]");

        if (q && input && !input.value) {
            input.value = q;
        }

        applyFilters(panel);
    });

    var backTop = document.querySelector(".back-top");

    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("is-visible", window.scrollY > 600);
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
})();
