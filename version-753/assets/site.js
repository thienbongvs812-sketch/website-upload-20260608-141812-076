(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startSlider() {
            stopSlider();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopSlider() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startSlider();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startSlider();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startSlider();
            });
        }

        slider.addEventListener('mouseenter', stopSlider);
        slider.addEventListener('mouseleave', startSlider);
        startSlider();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('.player-cover');
        var source = player.getAttribute('data-src');
        var loaded = false;
        var hlsInstance = null;

        function activatePlayer() {
            if (!video || !source) {
                return;
            }

            if (!loaded) {
                loaded = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                }
            }

            if (trigger) {
                trigger.classList.add('is-hidden');
            }

            var playTask = video.play();

            if (playTask && typeof playTask.catch === 'function') {
                playTask.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener('click', activatePlayer);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    activatePlayer();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });

    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchTitle = document.querySelector('[data-search-title]');

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card card-hover">',
            '    <a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
            '        <span class="cover-shade"></span>',
            '        <span class="quality-badge">高清</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line">',
            '            <a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.rating) + '分</span>',
            '        </div>',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '        <div class="card-foot">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function runSearch(query) {
        if (!searchResults || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var keyword = String(query || '').trim().toLowerCase();
        var data = window.MOVIE_SEARCH_INDEX;
        var results = [];

        if (keyword) {
            results = data.filter(function (movie) {
                return movie.searchText.indexOf(keyword) !== -1;
            }).slice(0, 120);
        } else {
            results = data.slice(0, 30);
        }

        if (searchTitle) {
            searchTitle.textContent = keyword ? '搜索结果' : '热门推荐';
        }

        if (!results.length) {
            searchResults.innerHTML = '<div class="content-card"><h2>没有找到匹配影片</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p></div>';
            return;
        }

        searchResults.innerHTML = results.map(movieCard).join('\n');
    }

    if (searchForm && searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (initial) {
            searchInput.value = initial;
            runSearch(initial);
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var value = searchInput.value.trim();
            var nextUrl = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            runSearch(value);
        });

        searchInput.addEventListener('input', function () {
            runSearch(searchInput.value);
        });
    }
})();
