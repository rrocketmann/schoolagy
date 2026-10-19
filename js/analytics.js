(function () {
  const TRACKING_ENDPOINT = 'https://your-analytics-endpoint.com/track';

  function trackEvent(gameName, event, data = {}) {
    const payload = {
      game: gameName,
      event,
      timestamp: Date.now(),
      ...data,
    };

    fetch(TRACKING_ENDPOINT, {
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