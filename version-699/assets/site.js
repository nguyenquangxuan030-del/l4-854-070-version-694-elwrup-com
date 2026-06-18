(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  function textOf(value) {
    return String(value || '').toLowerCase();
  }

  document.querySelectorAll('.filter-panel').forEach(function (panel) {
    var targetSelector = panel.getAttribute('data-target');
    var target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) {
      return;
    }

    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
    var empty = document.querySelector(panel.getAttribute('data-empty') || '');
    var input = panel.querySelector('[data-role="keyword"]');
    var region = panel.querySelector('[data-role="region"]');
    var year = panel.querySelector('[data-role="year"]');

    function applyFilter() {
      var keyword = textOf(input && input.value).trim();
      var regionValue = textOf(region && region.value).trim();
      var yearValue = textOf(year && year.value).trim();
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = textOf([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var okKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var okRegion = !regionValue || textOf(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
        var okYear = !yearValue || textOf(card.getAttribute('data-year')) === yearValue;
        var show = okKeyword && okRegion && okYear;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  document.querySelectorAll('.player-frame').forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-overlay');
    var url = button ? button.getAttribute('data-play-url') : '';
    var ready = false;
    var hlsInstance = null;

    function attachMedia() {
      if (!video || !url || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }

      ready = true;
    }

    function startPlayback() {
      attachMedia();
      frame.classList.add('is-playing');
      if (video) {
        video.controls = true;
        var playback = video.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
