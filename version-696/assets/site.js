(function() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    var showSlide = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
      var image = slides[current] ? slides[current].getAttribute('data-bg') : '';
      if (image) {
        hero.style.setProperty('--hero-image', 'url("' + image + '")');
      }
    };

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });

    if (slides.length) {
      showSlide(0);
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5800);
    }
  }

  var globalForms = document.querySelectorAll('[data-global-search]');
  globalForms.forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  var fillOptions = function(form) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
    var regionSelect = form.querySelector('[data-filter-region]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var addOptions = function(select, attr) {
      if (!select) {
        return;
      }
      var values = [];
      cards.forEach(function(card) {
        var value = card.getAttribute(attr);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort().slice(0, 80).forEach(function(value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };
    addOptions(regionSelect, 'data-region');
    addOptions(typeSelect, 'data-type');
  };

  var applyFilter = function(form) {
    var queryInput = form.querySelector('[data-filter-input]');
    var regionSelect = form.querySelector('[data-filter-region]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
    var visible = 0;

    cards.forEach(function(card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = (!query || text.indexOf(query) !== -1) && (!region || region === cardRegion) && (!type || type === cardType);
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    var empty = document.querySelector('[data-empty]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  };

  var filterForms = document.querySelectorAll('[data-filter-form]');
  filterForms.forEach(function(form) {
    fillOptions(form);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = form.querySelector('[data-filter-input]');
    if (q && input) {
      input.value = q;
    }
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      applyFilter(form);
    });
    form.addEventListener('input', function() {
      applyFilter(form);
    });
    form.addEventListener('change', function() {
      applyFilter(form);
    });
    applyFilter(form);
  });

  var players = document.querySelectorAll('[data-player]');
  players.forEach(function(player) {
    var video = player.querySelector('video');
    var layer = player.querySelector('.play-layer');

    var start = function() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      player.classList.add('is-playing');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = stream;
        }
        video.play().catch(function() {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsLive) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(function() {});
          });
          video.hlsLive = hls;
        } else {
          video.play().catch(function() {});
        }
        return;
      }
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function() {});
    };

    if (layer) {
      layer.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function() {
        if (!video.src) {
          start();
        }
      });
    }
  });
})();
