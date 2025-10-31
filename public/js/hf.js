async function loadHTML(id, file) {
  try {
    const container = document.getElementById(id);
    if (!container) return;

    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to fetch ${file}`);
    container.innerHTML = await res.text();

    if (id === "header") {
      initHeaderJS();
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHTML("header", "/header.html");
  loadHTML("footer", "/footer.html");
  loadHTML("footer2", "/footer2.html");
});

function initHeaderJS() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const megaBar = document.getElementById('megaBar');
  const overlay = document.querySelector('.menu-overlay');
  const dropdowns = navLinks.querySelectorAll('.dropdown');

  if (!hamburger || !navLinks || !megaBar) return;

  const megaMap = {};
  megaBar.querySelectorAll('.mega-column').forEach(col => {
    const key = col.dataset.menu;
    if (key) megaMap[key] = col;
  });

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('show');
    navLinks.classList.toggle('show', !isOpen);
    overlay.classList.toggle('show', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  overlay.addEventListener('click', () => {
    navLinks.classList.remove('show');
    overlay.classList.remove('show');
    Object.values(megaMap).forEach(col => col.classList.remove('show'));
    document.body.style.overflow = '';
  });

  dropdowns.forEach(drop => {
  const link = drop.querySelector('a');
  const key = link?.dataset.menu;
  const hasMega = megaMap[key];

  drop.addEventListener('click', (e) => {
    if (window.innerWidth <= 1560 && hasMega) {
      const isActive = hasMega.classList.contains('show');

      Object.values(megaMap).forEach(col => {
        col.classList.remove('show');
        if (col.parentElement !== megaBar) megaBar.appendChild(col);
      });

      if (!isActive) {
        drop.appendChild(hasMega);
        hasMega.classList.add('show');
      }

      if (e.target === link) {
        e.preventDefault(); 
      }
    }
  });
});

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1560) {
      navLinks.classList.remove('show');
      overlay.classList.remove('show');
      Object.values(megaMap).forEach(col => {
        col.classList.remove('show');
        if (col.parentElement !== megaBar) megaBar.appendChild(col);
      });
      document.body.style.overflow = '';
    }
  });
}
