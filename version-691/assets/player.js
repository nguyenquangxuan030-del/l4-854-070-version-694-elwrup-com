(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var buttons = Array.prototype.slice.call(player.querySelectorAll('[data-play-button]'));
    var loading = false;

    if (!video) {
      return;
    }

    async function attachWithLibrary(source) {
      var mod = await import('./assets/hls-vendor.js');
      var Hls = mod.H;

      if (!Hls || !Hls.isSupported()) {
        video.src = source;
        return;
      }

      if (!video.__streamer) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video.__streamer = hls;
      }
    }

    async function start() {
      if (loading) {
        return;
      }

      var source = video.getAttribute('data-stream');

      if (!source) {
        return;
      }

      loading = true;
      player.classList.add('is-loading');

      try {
        if (!video.src && video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (!video.__streamer && !video.src) {
          await attachWithLibrary(source);
        }

        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        if (!video.src) {
          video.src = source;
        }

        video.play().then(function () {
          player.classList.add('is-playing');
        }).catch(function () {
          player.classList.remove('is-playing');
        });
      } finally {
        loading = false;
        player.classList.remove('is-loading');
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', start);
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });
  });
})();
