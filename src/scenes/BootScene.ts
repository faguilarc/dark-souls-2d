import Phaser from 'phaser';
import { COLORS } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Generate all textures procedurally
    this.generateTextures();
    this.scene.start('PreloadScene');
  }

  private generateTextures(): void {
    this.generatePlayerTextures();
    this.generateEnemyTextures();
    this.generateBossTexture();
    this.generateTileTextures();
    this.generateBonfireTexture();
    this.generateParticleTextures();
    this.generateUITextures();
    this.generateWeaponTextures();
  }

  // ─── Player ────────────────────────────────────────────
  private generatePlayerTextures(): void {
    // Idle frame
    const g1 = this.add.graphics();
    // Body
    g1.fillStyle(COLORS.playerBody);
    g1.fillRect(4, 2, 10, 18);
    // Armor plate
    g1.fillStyle(COLORS.playerArmor);
    g1.fillRect(5, 4, 8, 8);
    // Helmet
    g1.fillStyle(COLORS.playerArmor);
    g1.fillRect(5, 0, 8, 4);
    g1.fillStyle(0x444455);
    g1.fillRect(7, 1, 4, 2);
    // Cape
    g1.fillStyle(COLORS.playerCape);
    g1.fillRect(14, 4, 3, 14);
    // Legs
    g1.fillStyle(COLORS.playerBody);
    g1.fillRect(5, 20, 4, 6);
    g1.fillRect(10, 20, 4, 6);
    // Boots
    g1.fillStyle(0x333340);
    g1.fillRect(4, 25, 5, 3);
    g1.fillRect(10, 25, 5, 3);
    g1.generateTexture('player_idle', 20, 28);
    g1.destroy();

    // Attack frame
    const g2 = this.add.graphics();
    g2.fillStyle(COLORS.playerBody);
    g2.fillRect(4, 2, 10, 18);
    g2.fillStyle(COLORS.playerArmor);
    g2.fillRect(5, 4, 8, 8);
    g2.fillStyle(COLORS.playerArmor);
    g2.fillRect(5, 0, 8, 4);
    g2.fillStyle(0x444455);
    g2.fillRect(7, 1, 4, 2);
    g2.fillStyle(COLORS.playerCape);
    g2.fillRect(14, 4, 3, 14);
    g2.fillStyle(COLORS.playerBody);
    g2.fillRect(5, 20, 4, 6);
    g2.fillRect(10, 20, 4, 6);
    g2.fillStyle(0x333340);
    g2.fillRect(4, 25, 5, 3);
    g2.fillRect(10, 25, 5, 3);
    // Sword extended
    g2.fillStyle(COLORS.playerSword);
    g2.fillRect(18, 2, 3, 3);
    g2.fillStyle(0xccccbb);
    g2.fillRect(17, 5, 5, 22);
    g2.fillStyle(0xddddcc);
    g2.fillRect(18, 5, 3, 22);
    g2.generateTexture('player_attack', 24, 28);
    g2.destroy();

    // Dodge frame (rolling)
    const g3 = this.add.graphics();
    g3.fillStyle(COLORS.playerArmor);
    g3.fillEllipse(10, 10, 18, 14);
    g3.fillStyle(COLORS.playerCape);
    g3.fillEllipse(12, 11, 12, 8);
    g3.generateTexture('player_dodge', 20, 20);
    g3.destroy();

    // Heal frame (drinking estus)
    const g4 = this.add.graphics();
    g4.fillStyle(COLORS.playerBody);
    g4.fillRect(4, 2, 10, 18);
    g4.fillStyle(COLORS.playerArmor);
    g4.fillRect(5, 4, 8, 8);
    g4.fillStyle(COLORS.playerArmor);
    g4.fillRect(5, 0, 8, 4);
    g4.fillStyle(0x444455);
    g4.fillRect(7, 1, 4, 2);
    g4.fillStyle(COLORS.playerCape);
    g4.fillRect(14, 4, 3, 14);
    g4.fillStyle(COLORS.playerBody);
    g4.fillRect(5, 20, 4, 6);
    g4.fillRect(10, 20, 4, 6);
    g4.fillStyle(0x333340);
    g4.fillRect(4, 25, 5, 3);
    g4.fillRect(10, 25, 5, 3);
    // Flask in hand
    g4.fillStyle(COLORS.estusGreen);
    g4.fillRect(2, 8, 4, 6);
    g4.fillStyle(0x55dd88);
    g4.fillRect(2, 10, 4, 4);
    g4.generateTexture('player_heal', 20, 28);
    g4.destroy();
  }

  // ─── Enemies ───────────────────────────────────────────
  private generateEnemyTextures(): void {
    const g = this.add.graphics();
    // Body (hollow/zombie-like)
    g.fillStyle(COLORS.enemyBody);
    g.fillRect(3, 2, 10, 16);
    // Head
    g.fillStyle(0x5a5a3a);
    g.fillRect(5, 0, 6, 4);
    // Eyes (glowing red)
    g.fillStyle(COLORS.enemyEyes);
    g.fillRect(6, 1, 2, 1);
    g.fillRect(9, 1, 2, 1);
    // Weapon (rusty sword)
    g.fillStyle(0x6a6a5a);
    g.fillRect(14, 4, 3, 18);
    g.fillStyle(0x8a8a6a);
    g.fillRect(15, 4, 1, 18);
    // Legs
    g.fillStyle(COLORS.enemyBody);
    g.fillRect(4, 18, 4, 6);
    g.fillRect(9, 18, 4, 6);
    g.generateTexture('enemy', 18, 24);
    g.destroy();

    // Enemy attack frame
    const g2 = this.add.graphics();
    g2.fillStyle(COLORS.enemyBody);
    g2.fillRect(3, 2, 10, 16);
    g2.fillStyle(0x5a5a3a);
    g2.fillRect(5, 0, 6, 4);
    g2.fillStyle(COLORS.enemyEyes);
    g2.fillRect(6, 1, 2, 1);
    g2.fillRect(9, 1, 2, 1);
    g2.fillStyle(0x6a6a5a);
    g2.fillRect(0, 2, 14, 3);
    g2.fillStyle(COLORS.enemyBody);
    g2.fillRect(4, 18, 4, 6);
    g2.fillRect(9, 18, 4, 6);
    g2.generateTexture('enemy_attack', 18, 24);
    g2.destroy();
  }

  // ─── Boss ──────────────────────────────────────────────
  private generateBossTexture(): void {
    const size = 48;
    const g = this.add.graphics();
    // Large body
    g.fillStyle(COLORS.bossBody);
    g.fillRect(8, 6, 28, 32);
    // Armor
    g.fillStyle(COLORS.bossArmor);
    g.fillRect(10, 8, 24, 18);
    // Helm
    g.fillStyle(0x3a1a3a);
    g.fillRect(12, 0, 20, 8);
    // Horns
    g.fillStyle(0x5a3a3a);
    g.fillRect(10, 0, 4, 6);
    g.fillRect(30, 0, 4, 6);
    // Eyes
    g.fillStyle(COLORS.bossEyes);
    g.fillRect(16, 3, 4, 2);
    g.fillRect(24, 3, 4, 2);
    // Cape
    g.fillStyle(0x2a0a2a);
    g.fillRect(36, 8, 6, 30);
    // Legs
    g.fillStyle(COLORS.bossBody);
    g.fillRect(12, 38, 8, 10);
    g.fillRect(24, 38, 8, 10);
    // Great sword
    g.fillStyle(COLORS.bossSword);
    g.fillRect(40, 4, 6, 44);
    g.fillStyle(0xaa3a3a);
    g.fillRect(41, 4, 4, 44);
    g.generateTexture('boss', 48, 48);
    g.destroy();

    // Boss attack
    const g2 = this.add.graphics();
    g2.fillStyle(COLORS.bossBody);
    g2.fillRect(8, 6, 28, 32);
    g2.fillStyle(COLORS.bossArmor);
    g2.fillRect(10, 8, 24, 18);
    g2.fillStyle(0x3a1a3a);
    g2.fillRect(12, 0, 20, 8);
    g2.fillStyle(0x5a3a3a);
    g2.fillRect(10, 0, 4, 6);
    g2.fillRect(30, 0, 4, 6);
    g2.fillStyle(COLORS.bossEyes);
    g2.fillRect(16, 3, 4, 2);
    g2.fillRect(24, 3, 4, 2);
    g2.fillStyle(0x2a0a2a);
    g2.fillRect(36, 8, 6, 30);
    g2.fillStyle(COLORS.bossBody);
    g2.fillRect(12, 38, 8, 10);
    g2.fillRect(24, 38, 8, 10);
    // Sword swing
    g2.fillStyle(COLORS.bossSword);
    g2.fillRect(0, 0, 44, 6);
    g2.fillStyle(0xaa3a3a);
    g2.fillRect(0, 0, 44, 4);
    g2.generateTexture('boss_attack', 48, 48);
    g2.destroy();
  }

  // ─── Tiles ─────────────────────────────────────────────
  private generateTileTextures(): void {
    // Ground tile
    const g = this.add.graphics();
    g.fillStyle(COLORS.ground);
    g.fillRect(0, 0, 32, 32);
    // Stone detail
    g.fillStyle(0x2e2e3a);
    g.fillRect(0, 0, 15, 15);
    g.fillRect(16, 16, 16, 16);
    g.fillStyle(0x262630);
    g.fillRect(0, 16, 16, 16);
    g.fillRect(16, 0, 16, 16);
    // Cracks
    g.fillStyle(0x222230);
    g.fillRect(8, 0, 1, 8);
    g.fillRect(24, 16, 1, 12);
    g.generateTexture('tile_ground', 32, 32);
    g.destroy();

    // Wall tile
    const g2 = this.add.graphics();
    g2.fillStyle(COLORS.wall);
    g2.fillRect(0, 0, 32, 32);
    // Brick pattern
    g2.fillStyle(COLORS.wallTop);
    g2.fillRect(1, 1, 14, 7);
    g2.fillRect(17, 1, 14, 7);
    g2.fillRect(1, 10, 6, 7);
    g2.fillRect(9, 10, 14, 7);
    g2.fillRect(25, 10, 6, 7);
    g2.fillRect(1, 19, 14, 7);
    g2.fillRect(17, 19, 14, 7);
    g2.fillRect(1, 28, 6, 3);
    g2.fillRect(9, 28, 14, 3);
    g2.fillRect(25, 28, 6, 3);
    // Dark mortar lines
    g2.fillStyle(0x12121a);
    g2.fillRect(0, 9, 32, 1);
    g2.fillRect(0, 18, 32, 1);
    g2.fillRect(0, 27, 32, 1);
    g2.fillRect(15, 0, 2, 9);
    g2.fillRect(7, 9, 2, 9);
    g2.fillRect(23, 9, 2, 9);
    g2.fillRect(15, 18, 2, 9);
    g2.generateTexture('tile_wall', 32, 32);
    g2.destroy();

    // Wall top (for vertical walls)
    const g3 = this.add.graphics();
    g3.fillStyle(COLORS.wallTop);
    g3.fillRect(0, 0, 32, 32);
    g3.fillStyle(COLORS.wall);
    g3.fillRect(0, 4, 32, 28);
    g3.fillStyle(0x44445a);
    g3.fillRect(0, 0, 32, 4);
    g3.fillStyle(0x3a3a50);
    g3.fillRect(0, 3, 32, 1);
    g3.generateTexture('tile_wall_top', 32, 32);
    g3.destroy();

    // Fog tile (decorative)
    const g4 = this.add.graphics();
    g4.fillStyle(COLORS.fog);
    g4.fillRect(0, 0, 32, 32);
    g4.setAlpha(0.3);
    g4.fillStyle(0x222238);
    g4.fillRect(0, 0, 32, 32);
    g4.setAlpha(1);
    g4.generateTexture('tile_fog', 32, 32);
    g4.destroy();
  }

  // ─── Bonfire ───────────────────────────────────────────
  private generateBonfireTexture(): void {
    const g = this.add.graphics();
    // Base/ashes
    g.fillStyle(0x2a2a2a);
    g.fillEllipse(16, 26, 28, 10);
    g.fillStyle(0x333333);
    g.fillEllipse(16, 25, 22, 6);
    // Sword in bonfire
    g.fillStyle(0x888888);
    g.fillRect(14, 4, 3, 20);
    g.fillStyle(0xaaaaaa);
    g.fillRect(15, 4, 1, 20);
    // Handle
    g.fillStyle(0x664422);
    g.fillRect(12, 22, 7, 3);
    // Flames
    g.fillStyle(COLORS.bonfireOrange);
    g.fillTriangle(16, 2, 8, 20, 24, 20);
    g.fillStyle(COLORS.bonfireRed);
    g.fillTriangle(16, 6, 10, 20, 22, 20);
    g.fillStyle(0xffcc44);
    g.fillTriangle(16, 10, 12, 20, 20, 20);
    g.generateTexture('bonfire', 32, 32);
    g.destroy();

    // Bonfire lit (animated will use this base)
    const g2 = this.add.graphics();
    g2.fillStyle(0x2a2a2a);
    g2.fillEllipse(16, 26, 28, 10);
    g2.fillStyle(0x333333);
    g2.fillEllipse(16, 25, 22, 6);
    g2.fillStyle(0x888888);
    g2.fillRect(14, 4, 3, 20);
    g2.fillStyle(0xaaaaaa);
    g2.fillRect(15, 4, 1, 20);
    g2.fillStyle(0x664422);
    g2.fillRect(12, 22, 7, 3);
    g2.generateTexture('bonfire_base', 32, 32);
    g2.destroy();
  }

  // ─── Particles ─────────────────────────────────────────
  private generateParticleTextures(): void {
    // Hit spark
    const g = this.add.graphics();
    g.fillStyle(COLORS.particle);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle_spark', 4, 4);
    g.destroy();

    // Blood
    const g2 = this.add.graphics();
    g2.fillStyle(COLORS.blood);
    g2.fillRect(0, 0, 3, 3);
    g2.generateTexture('particle_blood', 3, 3);
    g2.destroy();

    // Ember (bonfire)
    const g3 = this.add.graphics();
    g3.fillStyle(COLORS.bonfireOrange);
    g3.fillRect(0, 0, 3, 3);
    g3.generateTexture('particle_ember', 3, 3);
    g3.destroy();

    // Soul (on death)
    const g4 = this.add.graphics();
    g4.fillStyle(COLORS.soulsGold);
    g4.fillRect(2, 0, 4, 4);
    g4.fillRect(0, 2, 8, 4);
    g4.fillRect(2, 6, 4, 4);
    g4.generateTexture('particle_soul', 8, 10);
    g4.destroy();

    // Heal effect
    const g5 = this.add.graphics();
    g5.fillStyle(COLORS.estusGreen);
    g5.fillRect(0, 0, 4, 4);
    g5.generateTexture('particle_heal', 4, 4);
    g5.destroy();
  }

  // ─── UI ────────────────────────────────────────────────
  private generateUITextures(): void {
    // HP bar background
    const g = this.add.graphics();
    g.fillStyle(COLORS.uiBg);
    g.fillRect(0, 0, 200, 16);
    g.generateTexture('ui_bar_bg', 200, 16);
    g.destroy();

    // HP bar fill
    const g2 = this.add.graphics();
    g2.fillStyle(COLORS.hpBar);
    g2.fillRect(0, 0, 196, 12);
    g2.generateTexture('ui_hp_fill', 196, 12);
    g2.destroy();

    // Stamina bar fill
    const g3 = this.add.graphics();
    g3.fillStyle(COLORS.staminaBar);
    g3.fillRect(0, 0, 196, 8);
    g3.generateTexture('ui_stamina_fill', 196, 8);
    g3.destroy();

    // Estus icon
    const g4 = this.add.graphics();
    g4.fillStyle(COLORS.estusGreen);
    g4.fillRect(4, 0, 8, 4);
    g4.fillRect(2, 4, 12, 8);
    g4.fillRect(4, 12, 8, 4);
    g4.generateTexture('ui_estus', 16, 16);
    g4.destroy();

    // Boss HP bar bg
    const g5 = this.add.graphics();
    g5.fillStyle(COLORS.bossHpBg);
    g5.fillRect(0, 0, 400, 12);
    g5.generateTexture('ui_boss_hp_bg', 400, 12);
    g5.destroy();

    // Boss HP bar fill
    const g6 = this.add.graphics();
    g6.fillStyle(COLORS.bossHp);
    g6.fillRect(0, 0, 396, 8);
    g6.generateTexture('ui_boss_hp_fill', 396, 8);
    g6.destroy();
  }

  // ─── Weapons ───────────────────────────────────────────
  private generateWeaponTextures(): void {
    // Slash effect (arc approximation with triangles)
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.6);
    // Draw arc manually with line segments
    const cx = 4, cy = 16, r = 36;
    for (let a = -1.2; a < 1.2; a += 0.15) {
      const x1 = cx + Math.cos(a) * r;
      const y1 = cy + Math.sin(a) * r;
      const x2 = cx + Math.cos(a + 0.15) * r * 0.5;
      const y2 = cy + Math.sin(a + 0.15) * r * 0.5;
      g.fillTriangle(cx, cy, x1, y1, x2, y2);
    }
    g.generateTexture('slash_effect', 42, 32);
    g.destroy();

    // Boss slash (bigger)
    const g2 = this.add.graphics();
    g2.fillStyle(0xff4444, 0.5);
    const cx2 = 6, cy2 = 24, r2 = 54;
    for (let a = -1.0; a < 1.0; a += 0.12) {
      const x1 = cx2 + Math.cos(a) * r2;
      const y1 = cy2 + Math.sin(a) * r2;
      const x2 = cx2 + Math.cos(a + 0.12) * r2 * 0.4;
      const y2 = cy2 + Math.sin(a + 0.12) * r2 * 0.4;
      g2.fillTriangle(cx2, cy2, x1, y1, x2, y2);
    }
    g2.generateTexture('boss_slash_effect', 62, 48);
    g2.destroy();
  }
}