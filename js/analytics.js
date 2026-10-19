(function () {
  function trackEvent(gameName, event, data = {}) {
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

  if (window.gtag) {
    window.trackGameAnalytics = {
      start(gameName) {
        window.gtag('event', 'start_game', { game_name: gameName });
      },
      end(gameName, score) {
        window.gtag('event', 'end_game', { game_name: gameName, score });
      },
      restart(gameName) {
        window.gtag('event', 'restart_game', { game_name: gameName });
      },
    };
  } else {
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
  }
})();