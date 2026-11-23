(function () {
  var noop = function () {};
  var ok = function () { return Promise.resolve(); };
  var poki = {
    __sgNoAds: true,
    init: ok,
    initWithVideoHB: ok,
    commercialBreak: function (cb) { if (typeof cb === "function") cb(); return Promise.resolve(); },
    rewardedBreak: function (cb) { if (typeof cb === "function") cb(false); return Promise.resolve(false); },
    gameplayStart: noop,
    gameplayStop: noop,
    gameLoadingStart: noop,
    gameLoadingFinished: noop,
    gameLoadingProgress: noop,
    happyTime: noop,
    setDebug: noop,
    getURLParam: function () { return ""; }
  };
  window.PokiSDK = window.PokiSDK || poki;
})();
