const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const searchInput = document.querySelector('#product-search');
const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
const backToTop = document.querySelector('.back-to-top');

const normalize = (value) => value.toLowerCase().trim();

galleryItems.forEach((item) => {
  const image = item.querySelector('img');
  const code = item.querySelector('.lamp-code')?.textContent || '';
  const text = item.textContent || '';
  const type = code.startsWith('RL') ? 'floor' : 'table';

  item.dataset.type = type;
  item.dataset.search = normalize(`${code} ${text} ${type} lamp`);
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View ${code} details`);

  image.loading = 'lazy';
});

const updateActiveNav = () => {
  const current = sections.reduce((active, section) => {
    const top = section.getBoundingClientRect().top;
    return top <= 170 ? section : active;
  }, sections[0]);

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current?.id}`);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll('.section-card, .gallery-item, .catalogue-feature, .review-card').forEach((element) => {
  element.classList.add('reveal');
  revealObserver.observe(element);
});

let activeFilter = 'all';

const applyFilters = () => {
  const query = normalize(searchInput?.value || '');
  let visibleCount = 0;

  galleryItems.forEach((item) => {
    const matchesType = activeFilter === 'all' || item.dataset.type === activeFilter;
    const matchesQuery = !query || item.dataset.search.includes(query);
    const isVisible = matchesType && matchesQuery;

    item.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  document.querySelector('.gallery-section')?.style.setProperty('--visible-products', `"${visibleCount} products"`);
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    applyFilters();
  });
});

searchInput?.addEventListener('input', applyFilters);

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
  <div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="Product preview">
    <button class="lightbox-close" type="button" aria-label="Close preview">Close</button>
    <img alt="">
    <div class="lightbox-copy"></div>
  </div>
`;
document.body.appendChild(lightbox);

const lightboxImage = lightbox.querySelector('img');
const lightboxCopy = lightbox.querySelector('.lightbox-copy');
const lightboxClose = lightbox.querySelector('.lightbox-close');

const openLightbox = (item) => {
  const image = item.querySelector('img');
  const caption = item.querySelector('figcaption');

  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCopy.innerHTML = caption.innerHTML;
  lightbox.classList.add('open');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove('open');
  document.body.classList.remove('lightbox-open');
};

galleryItems.forEach((item) => {
  item.addEventListener('click', () => openLightbox(item));
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(item);
    }
  });
});

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target === lightboxClose) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});

const updateScrollControls = () => {
  updateActiveNav();
  backToTop?.classList.toggle('show', window.scrollY > 600);
};

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', updateScrollControls, { passive: true });
window.addEventListener('load', () => {
  updateScrollControls();
  applyFilters();
});
