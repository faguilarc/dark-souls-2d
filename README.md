# Ashen Legacy — 2D Dark Souls Inspired Web Game

A top-down 2D action RPG built with **Phaser 3 + TypeScript + Vite**, inspired by the Dark Souls series. All assets are procedurally generated — no external files needed.

## Features

- **Dark Souls Combat**: Attack, dodge roll with i-frames, stamina management
- **Estus Flask Healing**: Limited heals that restore at bonfires
- **Souls System**: Earn souls from killing enemies, lose half on death
- **Bonfire Checkpoints**: Rest to heal, refill estus, and respawn enemies
- **Enemy AI**: Hollows that patrol, chase, and attack
- **Boss Fight**: "The Ashen Lord" with 2 phases (enraged at 50% HP)
- **Atmospheric Effects**: Fog, vignette, particle embers, screen shake
- **Death & Respawn**: Classic "YOU DIED" screen with soul loss

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| SPACE | Attack |
| SHIFT | Dodge Roll |
| E | Drink Estus Flask |
| F | Rest at Bonfire |

## Setup

```bash
npm install
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build to /dist
npm run preview  # Preview production build
```

## Tech Stack

- **Phaser 3** — HTML5 Game Framework
- **TypeScript** — Type-safe game logic
- **Vite** — Fast dev server & bundler
- **Arcade Physics** — Built-in Phaser physics

## Architecture

```
src/
├── main.ts              # Game config & entry point
├── scenes/
│   ├── BootScene.ts     # Procedural texture generation
│   ├── PreloadScene.ts  # (Placeholder, textures are boot-generated)
│   ├── MenuScene.ts     # Title screen
│   ├── GameScene.ts     # Main gameplay, level, combat, particles
│   ├── HUDScene.ts      # Health, stamina, estus, souls, boss HP
│   └── DeathScene.ts    # "YOU DIED" screen
├── entities/
│   ├── Player.ts        # Player with full combat system
│   ├── Enemy.ts         # Hollow enemies with AI
│   └── Boss.ts          # Boss with 2-phase fight
└── utils/
    └── constants.ts     # All game balance & color constants
```

## License

MIT