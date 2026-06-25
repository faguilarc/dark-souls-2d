import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../utils/constants';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create(): void {
    this.add.graphics().fillStyle(C.black).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Atmospheric fog layers
    for (let i = 0; i < 8; i++) {
      const fog = this.add.graphics();
      fog.fillStyle(C.fog, 0.08 + i * 0.01);
      fog.fillCircle(GAME_WIDTH / 2 + Phaser.Math.Between(-200, 200), GAME_HEIGHT / 2 + Phaser.Math.Between(-100, 100), Phaser.Math.Between(100, 250));
      this.tweens.add({ targets: fog, x: fog.x + Phaser.Math.Between(-40, 40), y: fog.y + Phaser.Math.Between(-20, 20), alpha: 0.03, duration: Phaser.Math.Between(4000, 10000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 500 });
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 160, 'ASHEN\nLEGACY', {
      fontSize: '64px', fontFamily: 'Georgia, serif', color: '#7a7a8a', fontStyle: 'bold', align: 'center', lineSpacing: 8,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 260, 'Prepared to Die', {
      fontSize: '15px', fontFamily: 'Georgia, serif', color: '#3a3a4a', fontStyle: 'italic', align: 'center',
    }).setOrigin(0.5);

    // Divider
    const line = this.add.graphics();
    line.fillStyle(0x3a3a4a, 0.6); line.fillRect(GAME_WIDTH / 2 - 100, 285, 200, 1);

    // Start
    const startText = this.add.text(GAME_WIDTH / 2, 360, 'PRESS ENTER', {
      fontSize: '22px', fontFamily: 'Georgia, serif', color: '#6a6a7a', align: 'center',
    }).setOrigin(0.5);
    this.tweens.add({ targets: startText, alpha: 0.15, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Controls
    const controls = [
      'WASD  —  Move        Q  —  Lock-On',
      'SPACE  —  Attack (hold = Heavy)',
      'SHIFT  —  Dodge Roll    R  —  Parry',
      'E  —  Estus Flask      F  —  Bonfire',
    ];
    controls.forEach((t, i) => {
      this.add.text(GAME_WIDTH / 2, 430 + i * 26, t, {
        fontSize: '12px', fontFamily: 'monospace', color: '#333344', align: 'center',
      }).setOrigin(0.5);
    });

    this.input.keyboard!.once('keydown-ENTER', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => this.scene.start('GameScene'));
    });
  }
}