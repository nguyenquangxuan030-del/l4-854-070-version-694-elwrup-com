(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });

      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("is-open");
          menuButton.setAttribute("aria-expanded", "false");
        });
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }

        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var root = panel.parentElement || document;
      var input = panel.querySelector("[data-filter-search]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-search]"));
      var empty = panel.querySelector("[data-no-result]");
      var selected = "all";

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var filter = card.getAttribute("data-filter") || "";
          var keywordMatch = !keyword || search.indexOf(keyword) !== -1;
          var filterMatch = selected === "all" || filter.indexOf(selected) !== -1;
          var showCard = keywordMatch && filterMatch;
          card.classList.toggle("is-hidden", !showCard);
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          selected = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", apply);
      }

      apply();
    });
  });
})();
