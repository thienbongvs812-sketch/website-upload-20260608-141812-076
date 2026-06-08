(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.slider-dot'));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var heroForm = document.querySelector('.hero-search');
    if (heroForm) {
      heroForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = heroForm.querySelector('input');
        var query = input ? input.value.trim() : '';
        window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var regionSelect = document.querySelector('[data-region-select]');
    var yearSelect = document.querySelector('[data-year-select]');
    var genreSelect = document.querySelector('[data-genre-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title].movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (region && normalize(card.dataset.region).indexOf(region) === -1) {
          ok = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          ok = false;
        }
        if (genre && normalize(card.dataset.genre).indexOf(genre) === -1 && normalize(card.dataset.tags).indexOf(genre) === -1) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    [searchInput, regionSelect, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q');
      if (queryValue) {
        searchInput.value = queryValue;
      }
      filterCards();
    }

    var video = document.querySelector('[data-stream].movie-player');
    var startButton = document.querySelector('.player-start');
    var hlsPlayer = null;
    var mediaReady = false;

    function beginPlayback() {
      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      if (mediaReady) {
        video.play().catch(function () {});
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        mediaReady = true;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
          mediaReady = true;
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      mediaReady = true;
      video.play().catch(function () {});
    }

    if (startButton) {
      startButton.addEventListener('click', beginPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!mediaReady || video.paused) {
          beginPlayback();
        } else {
          video.pause();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsPlayer) {
          hlsPlayer.destroy();
        }
      });
    }
  });
}());
