import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../utils/constants';

export class DeathScene extends Phaser.Scene {
  constructor() { super({ key: 'DeathScene' }); }

  create(data: { souls: number }): void {
    const lostSouls = Math.floor(data.souls * 0.5);

    // Pure black with red pulse
    const bg = this.add.graphics();
    bg.fillStyle(0x000000); bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const redVig = this.add.graphics();
    redVig.fillStyle(C.blood, 0.08); redVig.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 350);

    // Blood drip effect
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
      const drip = this.add.graphics();
      drip.fillStyle(C.blood, 0.3);
      drip.fillRect(x, 0, Phaser.Math.Between(2, 5), 0);
      this.tweens.add({
        targets: drip, height: Phaser.Math.Between(80, 300),
        y: 0, alpha: 0.1, duration: Phaser.Math.Between(2000, 5000),
        ease: 'Power2', delay: i * 200,
      });
    }

    // "YOU DIED"
    const deathText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'YOU DIED', {
      fontSize: '72px', fontFamily: 'Georgia, serif', color: '#661111', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0).setScale(1.2);

    this.tweens.add({ targets: deathText, alpha: 1, scaleX: 1, scaleY: 1, duration: 2000, ease: 'Power3' });

    // Souls lost
    this.time.delayedCall(2500, () => {
      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `${lostSouls.toLocaleString()} Souls Lost`, {
        fontSize: '16px', fontFamily: 'Georgia, serif', color: '#444444', fontStyle: 'italic',
      }).setOrigin(0.5).setAlpha(0);

      this.time.delayedCall(500, () => {
        const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, 'PRESS ENTER TO RISE AGAIN', {
          fontSize: '14px', fontFamily: 'Georgia, serif', color: '#333344',
        }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: prompt, alpha: 0.7, duration: 800 });
        this.tweens.add({ targets: prompt, alpha: 0.15, duration: 1400, yoyo: true, repeat: -1, delay: 800 });

        this.input.keyboard!.once('keydown-ENTER', () => {
          this.cameras.main.fadeOut(800, 0, 0, 0);
          this.time.delayedCall(800, () => { this.scene.stop('HUDScene'); this.scene.start('GameScene'); });
        });
      });
    });
  }
}