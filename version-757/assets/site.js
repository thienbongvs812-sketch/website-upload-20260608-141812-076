(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!opened));
      panel.hidden = opened;
    });
  }

  function setupHero() {
    var slider = qs('#hero-slider');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyFilter(value) {
    var keyword = (value || '').trim().toLowerCase();
    var cards = qsa('.filter-grid .movie-card');
    cards.forEach(function (card) {
      var matched = !keyword || cardText(card).indexOf(keyword) !== -1;
      card.classList.toggle('is-hidden', !matched);
    });
  }

  function setupFilters() {
    var input = qs('.filter-input');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
    qsa('[data-filter-chip]').forEach(function (button) {
      button.addEventListener('click', function () {
        qsa('[data-filter-chip]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        var value = button.getAttribute('data-filter-chip') || '';
        input.value = value === '全部' ? '' : value;
        applyFilter(input.value);
      });
    });
    applyFilter(input.value);
  }

  function setupPlayer() {
    qsa('.video-shell').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('.video-play-button', shell);
      var url = shell.getAttribute('data-stream-url');
      var hls = null;

      function loadAndPlay() {
        if (!video || !url) {
          return;
        }
        if (!video.getAttribute('src')) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
          } else {
            video.src = url;
          }
        }
        var playResult = video.play();
        shell.classList.add('is-playing');
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', loadAndPlay);
      }
      shell.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!shell.classList.contains('is-playing')) {
          loadAndPlay();
        }
      });
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('is-playing');
          }
        });
        window.addEventListener('pagehide', function () {
          if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
