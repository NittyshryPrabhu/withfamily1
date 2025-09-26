(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (open) {
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
    } else {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  }

  hamburger.addEventListener('click', () => setMenu(mobileMenu.classList.contains('open') ? false : true));

  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Close mobile menu when resizing to larger screens
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800 && mobileMenu.classList.contains('open')) setMenu(false);
  });
})();

/* Movies cards: generate sample data and support "View all" toggle */
(function () {
  const sampleMovies = [];
  // generate 15 sample movie objects
  for (let i = 1; i <= 15; i++) {
    sampleMovies.push({
      id: i,
      title: `Movie ${i}`,
      year: 2020 + (i % 6),
      genre: ['Action','Drama','Comedy','Horror','Sci-Fi'][i % 5]
    });
  }

  const moviesRow = document.getElementById('moviesRow');
  const template = document.getElementById('movieCardTemplate');
  const viewAllBtn = document.getElementById('viewAllBtn');

  // initial state: showAll=false means single-row default; clicking View all will show grid
  let showAll = false;

  function renderMovies(items) {
    // clear
    moviesRow.innerHTML = '';
    // render each card
    items.forEach((m) => {
      const tmpl = template.content.cloneNode(true);
      const article = tmpl.querySelector('.movie-card');
      tmpl.querySelector('.title').textContent = m.title;
      tmpl.querySelector('.meta').textContent = `${m.year} • ${m.genre}`;
      // optional: attach click handler
      article.addEventListener('click', () => {
        // placeholder action
        alert(`${m.title} clicked`);
      });
      moviesRow.appendChild(tmpl);
    });

    // if showAll is true, add .all to display full grid; otherwise keep single-row default
    if (showAll) {
      moviesRow.classList.add('all');
      moviesRow.classList.remove('collapsed');
      viewAllBtn.textContent = 'Show less';
      viewAllBtn.setAttribute('aria-expanded', 'true');
    } else {
      moviesRow.classList.remove('all');
      viewAllBtn.textContent = 'View all';
      viewAllBtn.setAttribute('aria-expanded', 'false');
    }
  }

  // Initial render - render all cards but visually collapsed
  renderMovies(sampleMovies);

  // toggle behavior
  viewAllBtn.addEventListener('click', () => {
    showAll = !showAll;
    renderMovies(sampleMovies);
    // smooth scroll to section when expanding
    if (showAll) moviesRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Ensure keyboard accessibility: toggle with Enter/Space
  viewAllBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      viewAllBtn.click();
    }
  });
})();

/* Observe when movies section enters the viewport and hide hero overlay
   so cards visually overlap the hero video. This keeps the video fixed while
   content scrolls over it. */
(function () {
  const heroOverlay = document.querySelector('.hero-overlay');
  const moviesSection = document.querySelector('.movies-section');
  if (!heroOverlay) return;

  // Track if movies section is intersecting
  let moviesIntersecting = false;

  // Track whether the user has performed a scroll action since page load.
  let userHasScrolled = false;

  // Track whether hero section is currently visible
  let heroVisible = true; // assume visible on load

  // Observe movies section intersection
  if (moviesSection) {
    const moviesIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        moviesIntersecting = entry.isIntersecting;
        updateOverlayVisibility();
      });
    }, { root: null, threshold: 0 });
    moviesIo.observe(moviesSection);
  }

  // Observe hero section to show overlay whenever hero becomes visible
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        heroVisible = entry.isIntersecting;
        updateOverlayVisibility();
      });
    }, { root: null, threshold: 0.2 }); // consider hero visible when 20% is in view
    heroIo.observe(heroSection);
  }

  // Ensure overlay visible on initial load
  heroOverlay.classList.remove('hidden');

  function updateOverlayVisibility() {
    // If hero is visible, always show the overlay.
    if (heroVisible) {
      heroOverlay.classList.remove('hidden');
      return;
    }

    // Otherwise hide the overlay once the user has scrolled or when movies intersect
    if (userHasScrolled && (window.scrollY > 0 || moviesIntersecting)) {
      heroOverlay.classList.add('hidden');
    } else {
      heroOverlay.classList.remove('hidden');
    }
  }

  // Throttle scroll handler using requestAnimationFrame for smoothness
  let ticking = false;
  window.addEventListener('scroll', () => {
    // mark that the user has scrolled at least once
    userHasScrolled = true;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateOverlayVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
