(function () {
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 measurement ID
  const USE_GA = true; // Set to false to use only custom endpoint

  function sendGA(gameName, event, data = {}) {
    if (!USE_GA || !window.gtag) return;

    const params = {
      game: gameName,
      event,
      ...data,
    };

    window.gtag('event', event, {
      game_name: gameName,
      ...data,
      send_to: [GA_MEASUREMENT_ID],
    });
  }

  function trackEvent(gameName, event, data = {}) {
    if (USE_GA) {
      sendGA(gameName, event, data);
    }

    const payload = {
      game: gameName,
      event,
      timestamp: Date.now(),
      ...data,
    };

    fetch('https://your-analytics-endpoint.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }

  window.trackGameAnalytics = {
    start(gameName) {
      trackEvent(gameName, 'start');
    },
    end(gameName, score) {
      trackEvent(gameName, 'end', { score });
    },
    restart(gameName) {
      trackEvent(gameName, 'restart');
    },
  };
})();