import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, C } from '../utils/constants';

export class HUDScene extends Phaser.Scene {
  private hpBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private estusContainer!: Phaser.GameObjects.Container;
  private soulsText!: Phaser.GameObjects.Text;
  private bossName!: Phaser.GameObjects.Text;
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private bossContainer!: Phaser.GameObjects.Container;
  private lockOnHint!: Phaser.GameObjects.Text;
  private parryFlash!: Phaser.GameObjects.Graphics;

  constructor() { super({ key: 'HUDScene' }); }

  create(): void {
    this.hpBar = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.staminaBar = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.hpText = this.add.text(238, 56, '', { fontSize: '11px', fontFamily: 'Georgia, serif', color: '#aaaacc' }).setDepth(100).setScrollFactor(0);
    this.estusContainer = this.add.container(30, 82).setDepth(100).setScrollFactor(0);
    this.soulsText = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 30, '', { fontSize: '18px', fontFamily: 'Georgia, serif', color: '#ddaa33', align: 'right' }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);
    this.bossContainer = this.add.container(GAME_WIDTH / 2, 38).setDepth(100).setScrollFactor(0).setVisible(false);
    this.bossName = this.add.text(0, -20, '', { fontSize: '15px', fontFamily: 'Georgia, serif', color: '#8a8a9a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(100);
    this.bossContainer.add(this.bossName);
    this.bossHpBar = this.add.graphics().setDepth(100).setScrollFactor(0);
    this.bossContainer.add(this.bossHpBar);
    this.lockOnHint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '', { fontSize: '12px', fontFamily: 'Georgia, serif', color: '#555566' }).setOrigin(0.5).setDepth(100).setScrollFactor(0).setAlpha(0);
    this.parryFlash = this.add.graphics().setDepth(99).setScrollFactor(0);
  }

  updatePlayerStats(hp: number, maxHp: number, stamina: number, maxStamina: number, estus: number, maxEstus: number, souls: number): void {
    // HP bar with border
    this.hpBar.clear();
    this.hpBar.lineStyle(1, 0x444455, 0.8);
    this.hpBar.strokeRoundedRect(19, 41, 204, 22, 4);
    this.hpBar.fillStyle(C.uiBg, 0.85);
    this.hpBar.fillRoundedRect(20, 42, 202, 20, 3);
    const hpR = hp / maxHp;
    const hpC = hpR > 0.5 ? C.hpBar : (hpR > 0.25 ? 0xdd6622 : C.hpBarLow);
    this.hpBar.fillStyle(hpC);
    this.hpBar.fillRoundedRect(22, 44, Math.max(0, 198 * hpR), 16, 2);
    // Highlight on bar
    this.hpBar.fillStyle(0xffffff, 0.08);
    this.hpBar.fillRoundedRect(22, 44, Math.max(0, 198 * hpR), 7, 2);

    // Stamina bar
    this.staminaBar.clear();
    this.staminaBar.lineStyle(1, 0x333344, 0.6);
    this.staminaBar.strokeRoundedRect(19, 65, 204, 14, 3);
    this.staminaBar.fillStyle(C.uiBg, 0.85);
    this.staminaBar.fillRoundedRect(20, 66, 202, 12, 2);
    const sR = stamina / maxStamina;
    this.staminaBar.fillStyle(sR < 0.25 ? 0xddaa22 : C.staminaBar);
    this.staminaBar.fillRoundedRect(22, 68, Math.max(0, 198 * sR), 8, 1);

    this.hpText.setText(`${Math.ceil(hp)} / ${maxHp}`);

    // Estus icons
    this.estusContainer.removeAll(true);
    for (let i = 0; i < maxEstus; i++) {
      const icon = this.add.image(i * 20, 0, 'ui_estus').setTint(i < estus ? 0xffffff : 0x222222).setAlpha(i < estus ? 1 : 0.4);
      this.estusContainer.add(icon);
    }

    this.soulsText.setText(`${souls.toLocaleString()} Souls`);
  }

  updateSouls(souls: number): void {
    this.soulsText.setText(`${souls.toLocaleString()} Souls`);
    this.tweens.add({ targets: this.soulsText, alpha: 0.4, duration: 80, yoyo: true });
  }

  showBossHP(name: string, maxHp: number): void {
    this.bossContainer.setVisible(true);
    this.bossName.setText(name);
  }

  updateBossHP(hp: number): void {
    if (!this.bossContainer.visible) return;
    const gs = this.scene.get('GameScene') as any;
    const boss = gs?.getBoss?.();
    if (!boss) return;
    const ratio = hp / boss.getMaxHP();
    this.bossHpBar.clear();
    this.bossHpBar.lineStyle(1, 0x442222, 0.8);
    this.bossHpBar.strokeRoundedRect(-202, -2, 404, 18, 4);
    this.bossHpBar.fillStyle(C.bossHpBg, 0.9);
    this.bossHpBar.fillRoundedRect(-200, 0, 400, 14, 3);
    const color = boss.getPhase() === 2 ? 0xdd3322 : C.bossHp;
    this.bossHpBar.fillStyle(color);
    this.bossHpBar.fillRoundedRect(-198, 2, Math.max(0, 396 * ratio), 10, 2);
    this.bossHpBar.fillStyle(0xffffff, 0.06);
    this.bossHpBar.fillRoundedRect(-198, 2, Math.max(0, 396 * ratio), 4, 2);
  }

  updateBossPhase(phase: number): void {
    if (phase === 2) { this.bossName.setColor('#ff6644'); this.bossName.setText('THE ASHEN LORD  [ENRAGED]'); }
  }

  hideBossHP(): void { this.bossContainer.setVisible(false); }
}