(function () {
  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-to]'));
    var index = 0;

    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  var redirectSearch = document.querySelector('[data-redirect-search]');

  if (redirectSearch) {
    redirectSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = redirectSearch.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = redirectSearch.getAttribute('action') || './search.html';
      window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  }

  var panel = document.querySelector('[data-filter-panel]');
  var list = document.querySelector('[data-card-list]');

  if (panel && list) {
    var input = panel.querySelector('[data-filter-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    var normalize = function (value) {
      return String(value || '').toLowerCase();
    };

    var apply = function () {
      var q = normalize(input ? input.value : '');
      var selectedRegion = normalize(region ? region.value : '');
      var selectedType = normalize(type ? type.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }

        if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
          matched = false;
        }

        if (selectedType && cardType.indexOf(selectedType) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
