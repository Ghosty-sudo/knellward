(() => {
  "use strict";
  const controls = document.getElementById("mobileControls");
  if (!controls) return;

  const direct = (name, ...args) => {
    const api = window.KNELLWARD_INPUT;
    if (!api || typeof api[name] !== "function") return false;
    api[name](...args);
    return true;
  };

  const fireKey = (key, code) => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key, code: code || key, bubbles: true, cancelable: true }));
  };

  const actions = {
    up: () => direct("move", 0, -1) || fireKey("ArrowUp", "ArrowUp"),
    down: () => direct("move", 0, 1) || fireKey("ArrowDown", "ArrowDown"),
    left: () => direct("move", -1, 0) || fireKey("ArrowLeft", "ArrowLeft"),
    right: () => direct("move", 1, 0) || fireKey("ArrowRight", "ArrowRight"),
    wait: () => direct("wait") || fireKey(" ", "Space"),
    cleave: () => direct("ability", "cleave") || fireKey("1", "Digit1"),
    ward: () => direct("ability", "ward") || fireKey("2", "Digit2"),
    knell: () => direct("ability", "knell") || fireKey("3", "Digit3"),
    tonic: () => direct("tonic") || fireKey("q", "KeyQ"),
    pause: () => direct("pause") || fireKey("Escape", "Escape")
  };

  let lastTouch = 0;
  const activate = (button, event) => {
    event?.preventDefault();
    const action = actions[button.dataset.mobileAction];
    if (!action) return;
    if (navigator.vibrate) navigator.vibrate(10);
    action();
  };

  controls.querySelectorAll("button[data-mobile-action]").forEach((button) => {
    button.addEventListener("touchstart", (event) => { lastTouch = Date.now(); activate(button, event); }, { passive: false });
    button.addEventListener("pointerdown", (event) => { if (Date.now() - lastTouch < 700) return; activate(button, event); });
    button.addEventListener("click", (event) => { if (Date.now() - lastTouch < 700) { event.preventDefault(); return; } activate(button, event); });
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  document.addEventListener("touchmove", (event) => {
    if (event.target.closest?.("#mobileControls")) event.preventDefault();
  }, { passive: false });
})();
