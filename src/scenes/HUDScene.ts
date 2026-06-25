import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../utils/constants';

export class HUDScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private estusContainer!: Phaser.GameObjects.Container;
  private estusCount!: Phaser.GameObjects.Text;
  private soulsText!: Phaser.GameObjects.Text;
  private bossNameText!: Phaser.GameObjects.Text;
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private bossContainer!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    // HP Bar
    this.hpBar = this.add.graphics().setDepth(100).setScrollFactor(0);

    // Stamina Bar (below HP)
    this.staminaBar = this.add.graphics().setDepth(100).setScrollFactor(0);

    // HP text
    this.hpText = this.add.text(230, 52, '', {
      fontSize: '11px', fontFamily: 'Georgia, serif', color: '#aaaacc',
    }).setDepth(100).setScrollFactor(0);

    // Estus
    this.estusContainer = this.add.container(30, 75).setDepth(100).setScrollFactor(0);
    this.estusCount = this.add.text(22, 2, '', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#44cc66',
    }).setDepth(100).setScrollFactor(0);

    // Souls counter
    this.soulsText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 30, '', {
      fontSize: '16px', fontFamily: 'Georgia, serif', color: '#ddaa33',
      align: 'right',
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    // Boss HP bar (hidden initially)
    this.bossContainer = this.add.container(GAME_WIDTH / 2, 40).setDepth(100).setScrollFactor(0).setVisible(false);
    this.bossNameText = this.add.text(0, -18, '', {
      fontSize: '14px', fontFamily: 'Georgia, serif', color: '#8a8a9a',
    }).setOrigin(0.5).setDepth(100);
    this.bossContainer.add(this.bossNameText);

    this.bossHpBar = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.bossContainer.add(this.bossHpBar);

    // Status text (for "BONFIRE LIT", etc.)
    this.statusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '', {
      fontSize: '20px', fontFamily: 'Georgia, serif', color: '#ddaa33',
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0).setAlpha(0);
  }

  updatePlayerStats(
    hp: number, maxHp: number,
    stamina: number, maxStamina: number,
    estus: number, maxEstus: number,
    souls: number
  ): void {
    // HP Bar (left side, bottom)
    this.hpBar.clear();
    // Background
    this.hpBar.fillStyle(COLORS.uiBg, 0.8);
    this.hpBar.fillRoundedRect(20, 40, 204, 20, 3);
    // Fill
    const hpRatio = hp / maxHp;
    const hpColor = hpRatio > 0.5 ? COLORS.hpBar : (hpRatio > 0.25 ? 0xdd6622 : 0xff2222);
    this.hpBar.fillStyle(hpColor);
    this.hpBar.fillRoundedRect(22, 42, Math.max(0, 200 * hpRatio), 16, 2);

    // Stamina Bar (below HP)
    this.staminaBar.clear();
    this.staminaBar.fillStyle(COLORS.uiBg, 0.8);
    this.staminaBar.fillRoundedRect(20, 64, 204, 10, 2);
    const stamRatio = stamina / maxStamina;
    this.staminaBar.fillStyle(COLORS.staminaBar);
    this.staminaBar.fillRoundedRect(22, 66, Math.max(0, 200 * stamRatio), 6, 1);

    // HP text
    this.hpText.setText(`${Math.ceil(hp)} / ${maxHp}`);

    // Estus icons
    this.estusContainer.removeAll(true);
    for (let i = 0; i < maxEstus; i++) {
      const icon = this.add.image(i * 18, 0, 'ui_estus').setTint(i < estus ? 0xffffff : 0x333333);
      this.estusContainer.add(icon);
    }

    // Souls
    this.soulsText.setText(`${souls.toLocaleString()} Souls`);
  }

  updateSouls(souls: number): void {
    this.soulsText.setText(`${souls.toLocaleString()} Souls`);
    // Flash effect
    this.tweens.add({
      targets: this.soulsText,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });
  }

  showBossHP(name: string, maxHp: number): void {
    this.bossContainer.setVisible(true);
    this.bossNameText.setText(name);
  }

  updateBossHP(hp: number): void {
    if (!this.bossContainer.visible) return;

    const gameScene = this.scene.get('GameScene') as any;
    const boss = gameScene?.getBoss?.();
    if (!boss) return;

    const maxHp = boss.getMaxHP();
    const ratio = hp / maxHp;

    this.bossHpBar.clear();
    // Background
    this.bossHpBar.fillStyle(COLORS.bossHpBg, 0.9);
    this.bossHpBar.fillRoundedRect(-200, 0, 400, 14, 3);
    // Fill
    const color = boss.getPhase() === 2 ? 0xdd3322 : COLORS.bossHp;
    this.bossHpBar.fillStyle(color);
    this.bossHpBar.fillRoundedRect(-198, 2, Math.max(0, 396 * ratio), 10, 2);
  }

  updateBossPhase(phase: number): void {
    if (phase === 2) {
      this.bossNameText.setColor('#ff6644');
      this.bossNameText.setText('THE ASHEN LORD (ENRAGED)');
    }
  }

  hideBossHP(): void {
    this.bossContainer.setVisible(false);
  }
}