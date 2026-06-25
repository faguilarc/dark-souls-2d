import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { DeathScene } from './scenes/DeathScene';
import { MenuScene } from './scenes/MenuScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  backgroundColor: '#0a0a0c',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, HUDScene, DeathScene],
};

const game = new Phaser.Game(config);