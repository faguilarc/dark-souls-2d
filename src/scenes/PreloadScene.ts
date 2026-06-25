import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create(): void {
    // All textures are generated in BootScene, so we just transition
    this.scene.start('MenuScene');
  }
}