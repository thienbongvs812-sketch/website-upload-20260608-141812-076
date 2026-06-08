(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function initHeaderSearch() {
    selectAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value && form.classList.contains("header-search")) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function initCatalogFilter() {
    var grid = document.querySelector(".catalog-grid");
    if (!grid) {
      return;
    }
    var cards = selectAll(".movie-card", grid);
    var input = document.querySelector(".catalog-input");
    var clear = document.querySelector(".clear-filter");
    var typeValue = "";
    var yearValue = "";

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search"));
        var year = card.getAttribute("data-year") || "";
        var type = card.getAttribute("data-type") || "";
        var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
        var matchedType = !typeValue || type === typeValue;
        var matchedYear = !yearValue || year === yearValue;
        card.classList.toggle("is-filtered-out", !(matchedKeyword && matchedType && matchedYear));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
      input.addEventListener("input", applyFilter);
    }

    selectAll("[data-filter-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-type") || "";
        typeValue = typeValue === value ? "" : value;
        selectAll("[data-filter-type]").forEach(function (item) {
          item.classList.toggle("is-active", item.getAttribute("data-filter-type") === typeValue);
        });
        applyFilter();
      });
    });

    selectAll("[data-filter-year]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-year") || "";
        yearValue = yearValue === value ? "" : value;
        selectAll("[data-filter-year]").forEach(function (item) {
          item.classList.toggle("is-active", item.getAttribute("data-filter-year") === yearValue);
        });
        applyFilter();
      });
    });

    if (clear) {
      clear.addEventListener("click", function () {
        typeValue = "";
        yearValue = "";
        if (input) {
          input.value = "";
        }
        selectAll(".filter-chip").forEach(function (item) {
          item.classList.remove("is-active");
        });
        applyFilter();
      });
    }

    applyFilter();
  }

  window.bindMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-player");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsObject = null;

    function attach() {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsObject = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsObject.loadSource(streamUrl);
          hlsObject.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", attach);
    }
    selectAll(".player-trigger").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(attach, 180);
      });
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsObject) {
        hlsObject.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initHeaderSearch();
    initCatalogFilter();
  });
})();
