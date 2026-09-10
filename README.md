# KNELLWARD

A compact dark-fantasy pixel RPG built around a five-depth turn-based dungeon campaign and an unlockable Endless Descent.

## Current state
Sprint build `0.1.0`. The browser build is the fast playtest runtime; Steam/Windows is the product target.

## Browser playtest
Open `index.html` directly in a modern browser, or run a local static server.

## Controls
- Move / bump attack: WASD or Arrow Keys
- Cleave: 1
- Ward: 2
- Knell: 3
- Tonic: Q
- Pause: Escape
- Basic gamepad support: D-pad, face buttons, Start

## Windows package
Install development dependencies and run the Windows distribution script. The Electron wrapper is offline-only and denies external window creation.

## Release philosophy
The 1.0 scope is intentionally small: five depths, a final boss, build variation, saving, settings, audio, accessibility basics, and replay through Endless mode. Large overworlds, crafting, multiplayer, and content-heavy quest systems are excluded from the first release.
