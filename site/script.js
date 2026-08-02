(() => {
  const navDetails = document.getElementById("mobile-nav");
  const navToggle = document.getElementById("mobile-nav-toggle");
  const navSheet = document.getElementById("mobile-nav-links");

  if (!navDetails || !navToggle || !navSheet) {
    return;
  }

  function syncExpandedState() {
    navToggle.setAttribute("aria-expanded", navDetails.open ? "true" : "false");
    navToggle.setAttribute("aria-label", navDetails.open ? "Close menu" : "Open menu");
  }

  function closeMenu() {
    if (navDetails.open) {
      navDetails.removeAttribute("open");
    }

    syncExpandedState();
  }

  navToggle.addEventListener("click", (event) => {
    if (event.detail === 0) {
      return;
    }

    syncExpandedState();
  });

  navDetails.addEventListener("toggle", syncExpandedState);

  navSheet.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      navToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navDetails.open) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (!navDetails.contains(target)) {
      closeMenu();
    }
  });

  syncExpandedState();
})();
