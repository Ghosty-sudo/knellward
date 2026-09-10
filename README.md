# KNELLWARD

A compact dark-fantasy pixel RPG built around a five-depth turn-based dungeon campaign and an unlockable Endless Descent.

## Current state
Playtest build `0.1.4`. Steam / Windows PC remains the commercial target; the GitHub Pages build is the fast browser and mobile playtest runtime.

## Live playtest
https://ghosty-sudo.github.io/knellward/

## What changed in 0.1.4
- Enemies remain committed once they engage and use shortest-path pursuit around walls.
- Ranged and hex enemies fight from tighter distances instead of stretching encounters across rooms.
- Floors use fewer rooms, reducing dead travel while keeping enemy density high.
- Late-floor enemy scaling and elite frequency were increased modestly to reduce player snowballing.
- Killing an enemy with a bump attack moves the player into the defeated enemy's tile for faster melee flow.
- Added **Wait**: Space on keyboard or the center mobile pad advances one turn without moving, letting committed enemies come to you.
- HUD reports how many threats are currently committed.
- Ranged hits now have a visible beam and boss danger tiles have stronger contrast.
- Mourner's Coin now actually applies its advertised +15% score bonus as well as its loot benefit.
- Mobile touch controls remain a playtest layer; desktop is still the target product experience.

## Controls
- Move / bump attack: WASD or Arrow Keys
- Wait / hold position: Space
- Cleave: 1
- Ward: 2
- Knell: 3
- Tonic: Q
- Pause: Escape
- Mobile playtest: on-screen D-pad, center Wait button, abilities, Tonic, Pause
- Basic gamepad gameplay support: D-pad, face buttons, Start

## Windows package
Install development dependencies and run `npm run dist:win`. The Electron wrapper is offline-only and denies external window creation.

## Validation
Run `npm run check` to validate the current runtime source, mobile bridge, smoke tests, and procedural floor reachability checks. GitHub Actions runs the same checks on pushes and pull requests.

## Release philosophy
The 1.0 scope is intentionally small: five depths, a final boss, build variation, saving, settings, audio, accessibility basics, and replay through Endless mode. Large overworlds, crafting, multiplayer, and content-heavy quest systems are excluded from the first release.
