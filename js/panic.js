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
