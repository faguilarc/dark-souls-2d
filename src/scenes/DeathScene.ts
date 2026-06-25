import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants';

export class DeathScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DeathScene' });
  }

  create(data: { souls: number }): void {
    const lostSouls = Math.floor(data.souls * 0.5);

    // Pure black
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Red vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(COLORS.blood, 0.15);
    vignette.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 300);

    // "YOU DIED" text
    const deathText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'YOU DIED', {
      fontSize: '64px',
      fontFamily: 'Georgia, serif',
      color: '#882222',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({
      targets: deathText,
      alpha: 1,
      duration: 1500,
      ease: 'Power2',
    });

    // Souls lost text
    this.time.delayedCall(2000, () => {
      const soulsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `${lostSouls.toLocaleString()} Souls Lost`, {
        fontSize: '16px',
        fontFamily: 'Georgia, serif',
        color: '#555555',
        fontStyle: 'italic',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: soulsText,
        alpha: 0.8,
        duration: 1000,
      });

      // Prompt
      const promptText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 'PRESS ENTER TO RISE AGAIN', {
        fontSize: '14px',
        fontFamily: 'Georgia, serif',
        color: '#444455',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: promptText,
        alpha: 0.8,
        duration: 1000,
      });

      this.tweens.add({
        targets: promptText,
        alpha: 0.2,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        delay: 1000,
      });

      this.input.keyboard!.once('keydown-ENTER', () => {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.time.delayedCall(600, () => {
          this.scene.stop('HUDScene');
          this.scene.start('GameScene');
        });
      });
    });
  }
}