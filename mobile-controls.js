(() => {
  "use strict";

  const controls = document.getElementById("mobileControls");
  if (!controls) return;

  const fireKey = (key, code) => {
    window.dispatchEvent(new KeyboardEvent("keydown", {
      key,
      code: code || key,
      bubbles: true,
      cancelable: true
    }));
  };

  const pressExisting = (selector, fallbackKey, fallbackCode) => {
    const target = document.querySelector(selector);
    if (target && typeof target.click === "function") {
      target.click();
      return;
    }
    fireKey(fallbackKey, fallbackCode);
  };

  const actions = {
    up: () => fireKey("ArrowUp", "ArrowUp"),
    down: () => fireKey("ArrowDown", "ArrowDown"),
    left: () => fireKey("ArrowLeft", "ArrowLeft"),
    right: () => fireKey("ArrowRight", "ArrowRight"),
    cleave: () => pressExisting('[data-ability="cleave"]', "1", "Digit1"),
    ward: () => pressExisting('[data-ability="ward"]', "2", "Digit2"),
    knell: () => pressExisting('[data-ability="knell"]', "3", "Digit3"),
    tonic: () => pressExisting("#potionBtn", "q", "KeyQ"),
    pause: () => fireKey("Escape", "Escape")
  };

  const activate = (button) => {
    const action = actions[button.dataset.mobileAction];
    if (!action) return;
    if (navigator.vibrate) navigator.vibrate(12);
    action();
  };

  controls.querySelectorAll("button[data-mobile-action]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      activate(button);
    });
    button.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  document.addEventListener("touchmove", (event) => {
    if (event.target.closest?.("#mobileControls")) event.preventDefault();
  }, { passive: false });
})();
