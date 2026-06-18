(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      navToggle.classList.toggle('active', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-index')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(index);
    start();
  });

  document.querySelectorAll('.movie-search').forEach(function (form) {
    var list = form.parentElement ? form.parentElement.querySelector('[data-list]') : null;
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var input = form.querySelector('input[type="search"]');
    var type = form.querySelector('select[name="type"]');
    var year = form.querySelector('select[name="year"]');
    var result = form.querySelector('.result-count');

    if (!cards.length) {
      return;
    }

    function match(card, key, value) {
      if (!value) {
        return true;
      }
      return (card.getAttribute('data-' + key) || '').indexOf(value.toLowerCase()) !== -1;
    }

    function run() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ');
        var ok = (!query || haystack.indexOf(query) !== -1) && match(card, 'type', typeValue) && match(card, 'year', yearValue);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '匹配 ' + visible + ' 部影片';
      }
    }

    if (input) {
      input.addEventListener('input', run);
    }
    if (type) {
      type.addEventListener('change', run);
    }
    if (year) {
      year.addEventListener('change', run);
    }
    form.addEventListener('submit', function (event) {
      if (list) {
        event.preventDefault();
        run();
      }
    });
    run();
  });

  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('visible', window.scrollY > 480);
    }, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
