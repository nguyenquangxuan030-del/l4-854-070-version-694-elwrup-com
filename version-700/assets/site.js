(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 6200);
        }
    }

    var extractYear = function (text) {
        var match = String(text || '').match(/\b(19|20)\d{2}\b/);
        return match ? Number(match[0]) : 0;
    };

    var sortCards = function (list, value) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        if (value === 'year-desc') {
            cards.sort(function (a, b) {
                return extractYear(b.getAttribute('data-filter-text')) - extractYear(a.getAttribute('data-filter-text'));
            });
        } else if (value === 'title-asc') {
            cards.sort(function (a, b) {
                var titleA = (a.querySelector('h3') || {}).textContent || '';
                var titleB = (b.querySelector('h3') || {}).textContent || '';
                return titleA.localeCompare(titleB, 'zh-Hans-CN');
            });
        }
        cards.forEach(function (card) {
            list.appendChild(card);
        });
    };

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
        var scope = input.closest('section') || document;
        var list = scope.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var applyFilter = function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                card.classList.toggle('hidden-card', query && text.indexOf(query) === -1);
            });
        };
        input.addEventListener('input', applyFilter);
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-sort-select]')).forEach(function (select) {
        var scope = select.closest('section') || document;
        var list = scope.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        select.addEventListener('change', function () {
            sortCards(list, select.value);
        });
    });

    var playerBlocks = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
    playerBlocks.forEach(function (block) {
        var video = block.querySelector('video');
        var button = block.querySelector('.player-overlay');
        var src = block.getAttribute('data-hls-src');
        var loaded = false;
        var playVideoNow = function () {
            if (!video) {
                return;
            }
            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {});
            }
        };
        var loadVideo = function () {
            if (!video || !src || loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', playVideoNow, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideoNow);
            } else {
                video.src = src;
                video.addEventListener('loadedmetadata', playVideoNow, { once: true });
            }
        };
        var playVideo = function () {
            loadVideo();
            block.classList.add('is-ready');
            playVideoNow();
        };
        if (button) {
            button.addEventListener('click', playVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                block.classList.add('is-ready');
            });
        }
    });

    var globalInput = document.querySelector('[data-global-search-input]');
    var globalResults = document.querySelector('[data-global-results]');
    var globalSort = document.querySelector('[data-global-sort]');
    if (globalInput && globalResults) {
        var allMovies = [];
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        globalInput.value = initialQuery;
        var escapeHtml = function (value) {
            return String(value || '').replace(/[&<>"']/g, function (match) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[match];
            });
        };
        var render = function () {
            var query = globalInput.value.trim().toLowerCase();
            var rows = allMovies.filter(function (movie) {
                var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
                return !query || text.indexOf(query) !== -1;
            });
            if (globalSort && globalSort.value === 'year-desc') {
                rows.sort(function (a, b) {
                    return (Number(b.year) || 0) - (Number(a.year) || 0);
                });
            }
            if (globalSort && globalSort.value === 'title-asc') {
                rows.sort(function (a, b) {
                    return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN');
                });
            }
            globalResults.innerHTML = rows.slice(0, 240).map(function (movie) {
                var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card">' +
                    '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '</div>' +
                    '</article>';
            }).join('');
        };
        var acceptData = function (data) {
            allMovies = Array.isArray(data) ? data : [];
            render();
        };
        if (Array.isArray(window.SEARCH_MOVIES)) {
            acceptData(window.SEARCH_MOVIES);
        } else {
            fetch('./assets/movies-search.json')
                .then(function (response) {
                    return response.json();
                })
                .then(acceptData);
        }
        globalInput.addEventListener('input', render);
        if (globalSort) {
            globalSort.addEventListener('change', render);
        }
    }
})();
