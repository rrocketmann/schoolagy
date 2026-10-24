// Each opened game is one Google Analytics event named play_<folder>.
// In GA4: Reports → Engagement → Events. The count on play_snake is how
// many times Snake was opened. Restarts are not counted.
(function () {
  var GA_ID = 'G-C7MHSFPRSE';

  function slugOf(nameOrUrl) {
    var s = String(nameOrUrl || '').split('?')[0].replace(/\\/g, '/');
    if (s.indexOf('/') !== -1) s = s.split('/')[0];
    return s.replace(/\.html$/i, '');
  }

  // GA4 event names: letters, numbers, underscores, must start with a letter, max 40.
  function eventName(nameOrUrl) {
    var slug = slugOf(nameOrUrl).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return ('play_' + (slug || 'game')).slice(0, 40);
  }

  function ensureGa() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
      window.gtag('js', new Date());
    }
    if (!window.__sgGa) {
      window.gtag('config', GA_ID, { send_page_view: false });
      window.__sgGa = true;
    }
  }

  function trackPlay(nameOrUrl) {
    var slug = slugOf(nameOrUrl);
    if (!slug || slug === 'credits') return;
    ensureGa();
    window.gtag('event', eventName(slug), {
      send_to: GA_ID,
      game_name: slug
    });
  }

  window.schoolagyTrackPlay = trackPlay;
})();
