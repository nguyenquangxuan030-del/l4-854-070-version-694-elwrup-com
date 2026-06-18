(function () {
    var activeClass = 'active';

    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var previous = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle(activeClass, slideIndex === index);
            });
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }

        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function setupSearch() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-search-input]');
            var filterButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
            var targetSelector = panel.getAttribute('data-target') || '[data-search-item]';
            var items = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
            var currentFilter = 'all';

            function apply() {
                var keyword = normalize(input ? input.value : '');
                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute('data-search'));
                    var group = item.getAttribute('data-group') || 'all';
                    var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesFilter = currentFilter === 'all' || group === currentFilter;
                    item.classList.toggle('is-hidden', !(matchesText && matchesFilter));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            filterButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    currentFilter = button.getAttribute('data-filter') || 'all';
                    filterButtons.forEach(function (other) {
                        other.classList.toggle(activeClass, other === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function getVideoSource(video) {
        var source = video.querySelector('source[type="application/vnd.apple.mpegurl"]');
        if (source && source.getAttribute('src')) {
            return source.getAttribute('src');
        }
        return video.getAttribute('src') || '';
    }

    function prepareVideo(video) {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }
        var source = getVideoSource(video);
        if (!source) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.setAttribute('data-ready', '1');
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-ready', '1');
            return;
        }
        video.src = source;
        video.setAttribute('data-ready', '1');
    }

    function playFromShell(shell) {
        var video = shell.querySelector('video');
        if (!video) {
            return;
        }
        prepareVideo(video);
        shell.classList.add('is-playing');
        var begin = function () {
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };
        if (video.readyState > 0) {
            begin();
        } else {
            video.addEventListener('loadedmetadata', begin, { once: true });
            window.setTimeout(begin, 360);
        }
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play-button]');
            if (!video || shell.getAttribute('data-bound') === '1') {
                return;
            }
            shell.setAttribute('data-bound', '1');
            prepareVideo(video);
            if (button) {
                button.addEventListener('click', function () {
                    playFromShell(shell);
                });
            }
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        });
    }

    window.addEventListener('hls:ready', setupPlayers);
    onReady(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
