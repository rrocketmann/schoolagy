// Leaves the game on the ` key. Registered before game scripts, and it
// stops the event, so drive, jump, and menu keys are unchanged.
(function () {
  if (window.__sgPanic) return;
  window.__sgPanic = true;

  function framed() {
    try { return parent && parent !== window; } catch (err) { return true; }
  }

  function leave() {
    if (framed()) {
      try { parent.postMessage({ type: "sg-panic" }, location.origin); } catch (err) {}
      return;
    }
    location.href = new URL("../", location.href).href;
  }

  addEventListener("keydown", function (e) {
    if (e.repeat || e.code !== "Backquote") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    leave();
  }, true);

  addEventListener("message", function (e) {
    if (e.origin !== location.origin) return;
    if (!e.data || e.data.type !== "sg-panic") return;
    if (!e.source || e.source === window) return;
    leave();
  });
})();

// Games call an ad SDK and wait for it to finish. Skip the break and do
// not load the ad script, or the game sits on a blank ad.
(function () {
  if (window.__sgNoAds) return;
  window.__sgNoAds = true;

  var AD = /poki-sdk-core|game-cdn\.poki\.com|a\.poki\.com|api\.poki\.com|gamedistribution\.com|gamemonetize\.com|googlesyndication|doubleclick\.net|googleads|pagead2|adservice\.google|imasdk\.googleapis\.com|adinplay\.com|fundingchoicesmessages|googletagservices\.com\/tag\/js\/gpt|prebid\.adnxs\.com|prebid-server/i;

  function isAd(url) {
    return AD.test(String(url || ""));
  }

  try {
    var desc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
    if (desc && desc.set) {
      Object.defineProperty(HTMLScriptElement.prototype, "src", {
        configurable: true,
        set: function (value) {
          if (isAd(value)) return;
          desc.set.call(this, value);
        },
        get: function () { return desc.get.call(this); }
      });
    }
  } catch (err) {}

  var setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    var tag = this && this.tagName;
    if ((tag === "SCRIPT" || tag === "IFRAME") && String(name).toLowerCase() === "src" && isAd(value)) return;
    return setAttribute.apply(this, arguments);
  };

  function blockedNode(node) {
    if (!node || !node.tagName) return false;
    if (node.tagName !== "SCRIPT" && node.tagName !== "IFRAME") return false;
    return isAd(node.src || (node.getAttribute && node.getAttribute("src")));
  }

  var appendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function (node) {
    if (blockedNode(node)) return node;
    return appendChild.call(this, node);
  };
  var insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (node, ref) {
    if (blockedNode(node)) return node;
    return insertBefore.call(this, node, ref);
  };

  function noop() {}
  function ok() { return Promise.resolve(); }
  function callDone(arg) {
    try {
      if (typeof arg === "function") arg();
      else if (arg && typeof arg.adBreakDone === "function") arg.adBreakDone();
      else if (arg && typeof arg.adFinished === "function") arg.adFinished();
    } catch (err) {}
  }
  function commercialBreak(arg) {
    callDone(arg);
    return Promise.resolve();
  }
  function requestAd(type, callbacks) {
    var opts = callbacks && typeof callbacks === "object" ? callbacks : type;
    try {
      if (opts && typeof opts.adStarted === "function") opts.adStarted();
      if (opts && typeof opts.adFinished === "function") opts.adFinished();
      else callDone(opts);
    } catch (err) {}
    return Promise.resolve();
  }
  function showAd(type, opts) {
    callDone(typeof type === "function" ? type : opts);
    if (type && typeof type === "object") callDone(type);
    return Promise.resolve();
  }
  function rewardedBreak(arg) {
    if (typeof arg === "function") { try { arg(false); } catch (err) {} }
    return Promise.resolve(false);
  }

  var poki = {
    init: ok,
    initWithVideoHB: ok,
    commercialBreak: commercialBreak,
    rewardedBreak: rewardedBreak,
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
    setPlayerAge: noop,
    customEvent: noop,
    muteAd: noop,
    disableProgrammatic: noop,
    roundStart: noop,
    roundEnd: noop,
    getURLParam: function () { return ""; },
    shareableURL: function () { return Promise.resolve(location.href); },
    isAdBlocked: function () { return true; },
    getLeaderboard: function () { return Promise.resolve({}); }
  };
  var gdsdk = {
    showAd: showAd,
    showBanner: noop,
    preloadAd: ok,
    cancelAd: noop,
    showLeaderBoard: ok,
    AdType: { Display: "display", Interstitial: "interstitial", Rewarded: "rewarded" }
  };
  var crazy = {
    SDK: {
      ad: { requestAd: requestAd, hasAdblock: function () { return Promise.resolve(false); } },
      banner: { requestBanner: ok, requestOverlayBanners: noop, requestResponsiveBanner: ok },
      game: {
        gameplayStart: noop,
        gameplayStop: noop,
        loadingStart: noop,
        loadingStop: noop,
        inviteLink: function () { return ""; }
      }
    }
  };
  var adsbygoogle = [];
  adsbygoogle.push = function () { return 0; };

  function lock(name, value) {
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        get: function () { return value; },
        set: function () {}
      });
    } catch (err) {
      window[name] = value;
    }
  }
  lock("PokiSDK", poki);
  lock("gdsdk", gdsdk);
  lock("CrazyGames", crazy);
  lock("adsbygoogle", adsbygoogle);
  if (!window.sdk) window.sdk = { showBanner: noop, showAd: ok, showRewarded: rewardedBreak };

  function sweep(root) {
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll("ins.adsbygoogle, .adsbygoogle, [data-ad-client], [data-ad-slot], .ifNoAds, .supportComment, #smallSupport, #detectAds, #pokiSDKAdContainer, .pokiSdkContainer, iframe, a.ad");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.tagName === "IFRAME" && !isAd(el.getAttribute("src") || "")) continue;
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }
  function arm() {
    sweep(document);
    if (!window.MutationObserver || !document.documentElement) return;
    new MutationObserver(function () { sweep(document); }).observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arm);
  else arm();
  function ready() {
    try { window.dispatchEvent(new Event("SDK_READY")); } catch (err) {}
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
})();
