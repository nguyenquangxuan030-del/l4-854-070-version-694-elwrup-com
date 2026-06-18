document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-menu-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const menu = document.querySelector('[data-mobile-menu]');
      if (menu) {
        menu.classList.toggle('open');
      }
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let active = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => showSlide(active + 1), 5200);
  }

  document.querySelectorAll('[data-search-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-search-input]');
    const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
    const items = Array.from(scope.querySelectorAll('[data-search-item]'));
    const count = scope.querySelector('[data-search-count]');

    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const apply = () => {
      const query = normalize(input ? input.value : '');
      const filters = {};
      selects.forEach((select) => {
        filters[select.dataset.filterSelect] = normalize(select.value);
      });

      let visible = 0;
      items.forEach((item) => {
        const text = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.genre,
          item.dataset.year,
          item.dataset.category,
          item.textContent
        ].join(' '));
        const matchedQuery = !query || text.includes(query);
        const matchedFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) {
            return true;
          }
          return normalize(item.dataset[key]).includes(value);
        });
        const show = matchedQuery && matchedFilters;
        item.classList.toggle('hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    };

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach((select) => {
      select.addEventListener('change', apply);
    });
    apply();
  });
});
