# KNELLWARD Release Gate

## Implemented / verified in source
- [x] Complete campaign structure (5 depths -> boss -> ending)
- [x] Turn-based movement/combat core
- [x] XP/levels/relics/consumables/abilities
- [x] Multiple enemy archetypes + elites
- [x] Persistent enemy pursuit + shortest-path chase behavior
- [x] Wait action and faster melee follow-through
- [x] Endless mode unlock path
- [x] Death/restart/victory/credits
- [x] Tutorial/help
- [x] Save/resume and persistent meta/settings
- [x] Master/music/SFX controls
- [x] Reduced motion / shake / high contrast basics
- [x] Keyboard and basic gamepad gameplay input
- [x] Mobile touch playtest controls
- [x] Offline web runtime
- [x] Public GitHub implementation repository
- [x] GitHub Pages playtest deployment
- [x] Electron Windows packaging configuration includes current runtime/mobile payload files

## Release blockers remaining
- [ ] Human full campaign playtest
- [ ] Final balance/polish pass from human playtest evidence
- [ ] Real Chromium/browser visual smoke outside restricted automation sandbox
- [ ] Windows packaged build produced and launched on Windows
- [ ] Packaging icon (.ico) and final executable metadata
- [ ] Store capsule/header/library art
- [ ] 5-8 representative screenshots
- [ ] Trailer/gameplay capture
- [ ] Privacy/legal/support text finalization
- [ ] Steamworks app configuration and depot upload
- [ ] Valve store/build review prerequisites

## High-priority polish
- [x] Procedural campaign reachability validation in automated runtime QA
- [x] Boss telegraph contrast pass
- [x] Mobile playtest input layer
- [x] Runtime QA follows the same v0.1.2 payload + patch path used by the live build
- [ ] Verify gamepad menu navigation (current gamepad support focuses gameplay)
- [ ] Add native fullscreen toggle in packaged settings
- [ ] Fresh-install and corrupt-save testing in real browser/desktop package

## Classification
Current: **PLAYABLE / ALPHA** until the human campaign playtest and packaged Windows build are verified.
