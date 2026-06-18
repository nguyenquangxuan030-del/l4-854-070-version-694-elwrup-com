(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot") || 0);
        show(index);
        start();
      });
    });

    window.addEventListener("scroll", function () {
      var offset = Math.min(window.scrollY * 0.18, 120);
      hero.style.setProperty("--hero-offset", offset + "px");
    }, { passive: true });

    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-region-filter]");
    var year = document.querySelector("[data-year-filter]");
    var category = document.querySelector("[data-category-filter]");
    var count = document.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (!cards.length || (!input && !region && !year && !category)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function textOf(element) {
      return (element && element.value || "").trim().toLowerCase();
    }

    function apply() {
      var q = textOf(input);
      var regionValue = textOf(region);
      var yearValue = textOf(year);
      var categoryValue = textOf(category);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
          ok = false;
        }
        if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
          ok = false;
        }
        if (categoryValue && (card.getAttribute("data-category") || "").toLowerCase() !== categoryValue) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部";
      }
    }

    [input, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!shells.length) {
      return;
    }

    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-src]");
      var button = shell.querySelector(".play-cover");
      var source = video ? video.getAttribute("data-src") : "";
      var hls = null;
      var loading = false;

      if (!video || !source) {
        return;
      }

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function begin() {
        shell.classList.add("is-playing");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = source;
          }
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          if (!hls && !loading) {
            loading = true;
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            var parsedEvent = window.Hls.Events && window.Hls.Events.MANIFEST_PARSED;
            if (parsedEvent) {
              hls.on(parsedEvent, function () {
                playVideo();
              });
            } else {
              video.addEventListener("loadedmetadata", playVideo, { once: true });
            }
          } else {
            playVideo();
          }
          return;
        }

        if (!video.src) {
          video.src = source;
        }
        playVideo();
      }

      if (button) {
        button.addEventListener("click", begin);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
