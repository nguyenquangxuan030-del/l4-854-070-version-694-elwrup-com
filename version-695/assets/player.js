document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const cover = player.querySelector('.player-cover');
    const source = player.dataset.stream;
    const Hls = window.Hls;
    let hls = null;

    const attach = () => {
      if (!video || !source || video.dataset.ready === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.dataset.ready = '1';
    };

    const start = () => {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') {
          playing.catch(() => {});
        }
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', () => {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('emptied', () => {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
});
