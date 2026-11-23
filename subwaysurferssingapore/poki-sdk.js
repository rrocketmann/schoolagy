(function () {
  var noop = function () {};
  var ok = function () { return Promise.resolve(); };
  var rewarded = function (cb) {
    if (typeof cb === "function") cb(false);
    return Promise.resolve(false);
  };
  var commercial = function (cb) {
    if (typeof cb === "function") cb();
    return Promise.resolve();
  };
  if (window.PokiSDK && window.PokiSDK.__sgNoAds) return;
  var poki = {
    __sgNoAds: true,
    init: ok,
    initWithVideoHB: ok,
    commercialBreak: commercial,
    rewardedBreak: rewarded,
    displayAd: noop,
    destroyAd: noop,
    gameplayStart: noop,
    gameplayStop: noop,
    gameLoadingStart: noop,
    gameLoadingFinished: noop,
    gameLoadingProgress: noop,
    gameInteractive: noop,
    happyTime: noop,
    setDebug: noop,
    customEvent: noop,
    getURLParam: function () { return ""; },
    shareableURL: function () { return Promise.resolve(location.href); }
  };
  ["disableProgrammatic", "roundStart", "roundEnd", "muteAd", "setPlayerAge", "togglePlayerAdvertisingConsent", "toggleNonPersonalized", "setConsentString", "logError", "sendHighscore", "setDebugTouchOverlayController"].forEach(function (name) {
    poki[name] = noop;
  });
  try {
    Object.defineProperty(window, "PokiSDK", {
      configurable: true,
      get: function () { return poki; },
      set: function () {}
    });
  } catch (err) {
    window.PokiSDK = poki;
  }
})();
