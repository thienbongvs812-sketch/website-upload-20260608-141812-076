(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function bindFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var activeFilter = "all";

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var typeText = (card.getAttribute("data-type") || "").toLowerCase();
          var regionText = (card.getAttribute("data-region") || "").toLowerCase();
          var matchesQuery = !query || searchText.indexOf(query) !== -1;
          var matchesFilter = activeFilter === "all" || typeText.indexOf(activeFilter) !== -1 || regionText.indexOf(activeFilter) !== -1 || searchText.indexOf(activeFilter) !== -1;
          var shouldShow = matchesQuery && matchesFilter;
          card.classList.toggle("is-hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = (button.getAttribute("data-filter-button") || "all").toLowerCase();
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          update();
        });
      });

      update();
    });
  }

  ready(function () {
    bindNavigation();
    bindHero();
    bindFilters();
  });
})();
