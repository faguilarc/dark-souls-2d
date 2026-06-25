import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Dark atmospheric background
    const bg = this.add.graphics();
    bg.fillStyle(0x050508);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Fog / atmosphere particles
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, GAME_HEIGHT);
      const alpha = Phaser.Math.FloatBetween(0.02, 0.08);
      const size = Phaser.Math.Between(20, 80);
      const fog = this.add.graphics();
      fog.fillStyle(COLORS.fog, alpha);
      fog.fillCircle(x, y, size);
    }

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 180, 'ASHEN LEGACY', {
      fontSize: '52px',
      fontFamily: 'Georgia, serif',
      color: '#8a8a9a',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 240, 'A Dark Souls Inspired Experience', {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#4a4a5a',
      fontStyle: 'italic',
      align: 'center',
    }).setOrigin(0.5);

    // Divider line
    const line = this.add.graphics();
    line.fillStyle(0x3a3a4a);
    line.fillRect(GAME_WIDTH / 2 - 120, 270, 240, 1);

    // Start prompt (blinking)
    const startText = this.add.text(GAME_WIDTH / 2, 380, 'PRESS ENTER TO AWAKEN', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      color: '#6a6a7a',
      align: 'center',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.2,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Controls info
    const controls = [
      'WASD  —  Move',
      'SPACE  —  Attack',
      'SHIFT  —  Dodge Roll',
      'E  —  Drink Estus Flask',
      'F  —  Rest at Bonfire',
    ];

    controls.forEach((text, i) => {
      this.add.text(GAME_WIDTH / 2, 460 + i * 24, text, {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#3a3a4a',
        align: 'center',
      }).setOrigin(0.5);
    });

    // Enter key to start
    this.input.keyboard!.once('keydown-ENTER', () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.start('GameScene');
      });
    });
  }
}