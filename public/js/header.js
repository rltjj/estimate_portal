document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const megaBar = document.getElementById('megaBar');
  const megaColumns = megaBar.querySelectorAll('.mega-column');
  const dropdowns = navLinks.querySelectorAll('.dropdown');

  const overlay = document.createElement('div');
  overlay.classList.add('menu-overlay');
  document.body.appendChild(overlay);

  function openMenu() {
    navLinks.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    megaBar.classList.remove('show');
    megaColumns.forEach(col => col.classList.remove('show'));
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('show');
    if (isOpen) closeMenu();
    else openMenu();
  });

  overlay.addEventListener('click', closeMenu);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  dropdowns.forEach((drop, index) => {
  const link = drop.querySelector('a');

  link.addEventListener('click', (e) => {
    if (window.innerWidth > 1560) return;

    e.preventDefault();
    e.stopPropagation();

    const isActive = megaColumns[index].classList.contains('show');

    megaColumns.forEach(col => col.classList.remove('show'));
    megaBar.classList.remove('show');

    if (!isActive) {
      megaBar.classList.add('show');  
      megaColumns[index].classList.add('show'); 
    } 
  });
});

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1560) {
      closeMenu();
    }
  });
});
