document.addEventListener('DOMContentLoaded', () => {
  const btnClose = document.getElementById('btn-close');
  const kofiLink = document.getElementById('kofi-link');

  btnClose.addEventListener('click', () => {
    window.withFave.closeInfo();
  });

  kofiLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.withFave.openExternal('https://ko-fi.com/H2H61W7DT8');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.withFave.closeInfo();
    }
  });
});
