# Mehter

**Play online:** https://furkiozknn.github.io/mehter/ (desktop and phone, no install)

![Mehter gameplay: hitting the drum notes as the band marches](docs/gameplay.gif)

A 3D rhythm march through an old Ottoman parade avenue. The band (kös and davul drummers, zurna players, a çevgen bearer and the mehterbaşı) walks towards you while notes roll down four lanes. Hit them on the beat, hold the zurna notes, and keep the band's spirit above zero.

Everything is one `index.html`: the world, the band, the songs and the music are generated in code. A few CC0 assets (band models, a cobblestone texture, two short sounds) are loaded on top; the game works without them. See [Assets](#assets).

## How to play

- Notes roll towards the hit line on the road in front of the band.
- Press the lane key when a note reaches the line: **Perfect** (within 45 ms), **Good** (within 110 ms), otherwise a miss.
- Zurna notes are long: press, then hold until the end of the note. Releasing too early breaks the note.
- Combos raise the score multiplier (x2 at 10, x3 at 25, x4 at 50).
- Band spirit drops on misses and rises on hits. At zero the song ends.
- Songs come in Easy, Normal and Hard. Harder charts add notes from the same rhythm patterns, so every chart matches the music.
- Results show a grade (S, A, B, C), a hit-timing histogram and your best score per song and difficulty.

### Controls

| Action | Keys |
|---|---|
| Lanes (davul, kös, zurna, zil) | `D` `F` `J` `K` (rebindable in Settings) |
| Touch | tap the four lane zones at the bottom of the screen |
| Gamepad | face buttons 0-3 |
| Pause / back | `P` or `Esc` |
| Music on/off | `M` |
| Effects on/off | `X` |
| Language (TR / EN) | `L` |

The game starts in Turkish. Use the TR / EN button or `L` to switch.

## Calibration

Open **Calibration** from the title screen, press **Start**, and tap a key or the **Tap** button on each metronome beat. The median offset is saved and subtracted from every hit judgement.

## URL flags

| Flag | Effect |
|---|---|
| `?auto` | The bot plays through all six songs (Normal) to the end |
| `?debug` | Shows draw calls, fps, triangles, state and any JS errors on screen |
| `?sim=N` | Fast-forwards N seconds of song time before the first frame, without rendering |
| `?low` | Turns shadows off and halves the particle count |
| `?noassets` | Skips the CC0 asset files and keeps the procedural world and synthesised sounds |
| `?lang=en` | Starts in English |
| `?song=N` | Song index (0-5) for `?auto` and `?sim` |
| `?screen=…` | Opens `settings`, `pause`, `select`, `calib` or `results` directly (for screenshots) |

In the browser console, `window.mehter.state()` returns the live state and `window.mehterSim(seconds)` fast-forwards the current song.

## Running it

Serve the folder over HTTP (browsers block some features on `file://`), then open the page:

```
python -m http.server 8000
```

Then open `http://localhost:8000/`. Three.js r170 loads from jsDelivr, so the page needs internet access on first load.

## Technical notes

- Three.js r170 as an ES module (import map), MeshLambert materials, one directional light with a 1024 shadow map, InstancedMesh for crowd, band, trees, notes and torches, merged static geometry with vertex colours. Particles are `Points` with a soft round sprite.
- Audio is synthesised with Web Audio and scheduled on the audio clock. Hits are judged against that clock, minus the calibrated input offset.
- Settings are stored in `localStorage` under `arena.mehter.settings`, and best results under `arena.mehter.best`.
- Performance target: 60 fps on an Intel UHD 620 at 1280x720, with 24 to 28 draw calls in the tested scenes (28 with the assets loaded).

## How it was made

Built by Claude Haiku 5.5 with Claude Code from one prompt: [prompts/mehter.md](prompts/mehter.md). The shared arena rules were appended to that prompt.

## Screenshots

| Title | Gameplay |
|---|---|
| ![Title](docs/title.png) | ![Gameplay](docs/gameplay.png) |
| ![Song select](docs/song-select.png) | ![Settings](docs/settings.png) |
| ![Results](docs/results.png) | ![Phone layout](docs/phone.png) |

## Assets

- Band models (`assets/models/`): the davul, kös, zurna and çevgen players and the mehterbaşı's tall börk are built in Blender from scripts in `assets/src/`. A procedural version stays in place until the models load.
- Avenue: a cobblestone texture (`assets/textures/cobble.jpg`) on the road, with plane trees and crowd figures built in code.
- Light: a dusk HDRI (`assets/sky/dusk.hdr`) on the High quality tier only.
- Sounds (`assets/sfx/`): a UI click and the results fanfare. The music, hit sounds and crowd cheers are still synthesised.
- Sources, licences and sizes: [CREDITS.md](CREDITS.md) and [docs/assets.md](docs/assets.md).

## License

MIT. See [LICENSE](LICENSE).

---

Claude Game Arena · built by Claude Haiku 5.5
