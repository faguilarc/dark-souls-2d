import Phaser from 'phaser';
import { C, TILE_SIZE } from '../utils/constants';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create(): void {
    this.generateAllTextures();
    this.scene.start('PreloadScene');
  }

  private generateAllTextures(): void {
    this.makeTiles();
    this.makePlayer();
    this.makeHollow();
    this.makeKnight();
    this.makeBoss();
    this.makeBonfire();
    this.makeTorch();
    this.makeDecorations();
    this.makeParticles();
    this.makeUI();
    this.makeSlashEffects();
    this.makeLockOnIndicator();
  }

  // ═══════════════════════════════════════════════════════════
  //  TILES — multiple ground/wall variants for visual variety
  // ═══════════════════════════════════════════════════════════
  private makeTiles(): void {
    const S = TILE_SIZE;
    // Ground variant 1 (stone bricks)
    let g = this.add.graphics();
    g.fillStyle(C.ground1); g.fillRect(0, 0, S, S);
    g.fillStyle(C.ground2); g.fillRect(0, 0, 15, 15); g.fillRect(16, 16, 16, 16);
    g.fillStyle(C.groundCrack);
    g.fillRect(7, 0, 1, 10); g.fillRect(22, 18, 1, 14);
    g.fillRect(0, 24, 8, 1); g.fillRect(18, 6, 10, 1);
    g.generateTexture('ground1', S, S); g.destroy();

    // Ground variant 2
    g = this.add.graphics();
    g.fillStyle(C.ground2); g.fillRect(0, 0, S, S);
    g.fillStyle(C.ground1); g.fillRect(0, 0, 15, 15); g.fillRect(16, 16, 16, 16);
    g.fillStyle(C.groundCrack);
    g.fillRect(15, 0, 1, S); g.fillRect(0, 15, S, 1);
    g.fillRect(4, 20, 6, 1); g.fillRect(20, 4, 8, 1);
    g.generateTexture('ground2', S, S); g.destroy();

    // Ground variant 3 (worn)
    g = this.add.graphics();
    g.fillStyle(C.ground1); g.fillRect(0, 0, S, S);
    g.fillStyle(C.groundCrack);
    g.fillRect(5, 5, 22, 1); g.fillRect(12, 12, 1, 18);
    g.fillRect(20, 2, 1, 10); g.fillRect(2, 25, 14, 1);
    g.fillStyle(C.ground2); g.fillRect(8, 20, 10, 6);
    g.generateTexture('ground3', S, S); g.destroy();

    // Wall tile with 3D bevel
    g = this.add.graphics();
    g.fillStyle(C.wall); g.fillRect(0, 0, S, S);
    // Top bevel (light)
    g.fillStyle(C.wallHi); g.fillRect(0, 0, S, 2);
    // Left bevel
    g.fillRect(0, 0, 2, S);
    // Bottom bevel (dark)
    g.fillStyle(C.wallLo); g.fillRect(0, S - 2, S, 2);
    g.fillRect(S - 2, 0, 2, S);
    // Brick pattern
    g.fillStyle(C.wallHi);
    g.fillRect(3, 3, 12, 6); g.fillRect(17, 3, 12, 6);
    g.fillRect(10, 11, 12, 6);
    g.fillRect(3, 19, 12, 6); g.fillRect(17, 19, 12, 6);
    g.fillRect(10, 27, 12, 3);
    // Mortar lines
    g.fillStyle(C.wallMortar);
    g.fillRect(0, 9, S, 2); g.fillRect(0, 17, S, 2); g.fillRect(0, 25, S, 2);
    g.fillRect(15, 0, 2, 9); g.fillRect(8, 9, 2, 8); g.fillRect(22, 9, 2, 8);
    g.fillRect(15, 17, 2, 8);
    g.generateTexture('wall', S, S); g.destroy();

    // Wall corner/pillar
    g = this.add.graphics();
    g.fillStyle(C.wall); g.fillRect(0, 0, S, S);
    g.fillStyle(C.wallHi); g.fillRect(0, 0, S, 2); g.fillRect(0, 0, 2, S);
    g.fillStyle(C.wallLo); g.fillRect(0, S - 2, S, 2); g.fillRect(S - 2, 0, 2, S);
    g.fillStyle(C.wallHi); g.fillRect(6, 6, 20, 20);
    g.fillStyle(C.wallMortar); g.fillRect(4, 4, 24, 1); g.fillRect(4, 4, 1, 24);
    g.fillRect(4, 27, 24, 1); g.fillRect(27, 4, 1, 24);
    g.generateTexture('wall_pillar', S, S); g.destroy();

    // Fog overlay
    g = this.add.graphics();
    g.fillStyle(C.fog, 0.4); g.fillRect(0, 0, S, S);
    g.generateTexture('fog', S, S); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  PLAYER — detailed pixel art with outline & shading
  // ═══════════════════════════════════════════════════════════
  private makePlayer(): void {
    const W = 24, H = 32;

    // Helper: draw outline then body
    const drawOutlined = (g: Phaser.GameObjects.Graphics, fn: () => void, ox = 0, oy = 0) => {
      g.fillStyle(0x000000);
      fn(); // draw black first at offsets for outline
      g.fillStyle(0xffffff);
      fn(); // then draw colored
    };

    // ── Idle ──
    let g = this.add.graphics();
    // Outline pass
    this.drawPlayerShape(g, 0x000000, 1, 1);
    this.drawPlayerShape(g, 0x000000, -1, 0);
    this.drawPlayerShape(g, 0x000000, 1, 0);
    this.drawPlayerShape(g, 0x000000, 0, 1);
    this.drawPlayerShape(g, 0x000000, 0, -1);
    // Main pass
    this.drawPlayerShape(g, 0, 0, 0);
    g.generateTexture('player_idle', W, H); g.destroy();

    // ── Walk (slight lean) ──
    g = this.add.graphics();
    this.drawPlayerShape(g, 0x000000, 1, 1);
    this.drawPlayerShape(g, 0x000000, -1, 0);
    this.drawPlayerShape(g, 0x000000, 1, 0);
    this.drawPlayerShape(g, 0x000000, 0, 1);
    this.drawPlayerShape(g, 0x000000, 0, -1);
    this.drawPlayerShape(g, 0, 0, 0, true); // walk variant
    g.generateTexture('player_walk', W, H); g.destroy();

    // ── Light Attack ──
    g = this.add.graphics();
    this.drawPlayerShape(g, 0x000000, 1, 1);
    this.drawPlayerShape(g, 0x000000, -1, 0);
    this.drawPlayerShape(g, 0x000000, 1, 0);
    this.drawPlayerShape(g, 0x000000, 0, 1);
    this.drawPlayerShape(g, 0x000000, 0, -1);
    this.drawPlayerShape(g, 0, 0, 0, false, 'light');
    g.generateTexture('player_attack_light', W + 16, H); g.destroy();

    // ── Heavy Attack ──
    g = this.add.graphics();
    this.drawPlayerShape(g, 0x000000, 1, 1);
    this.drawPlayerShape(g, 0x000000, -1, 0);
    this.drawPlayerShape(g, 0x000000, 1, 0);
    this.drawPlayerShape(g, 0x000000, 0, 1);
    this.drawPlayerShape(g, 0x000000, 0, -1);
    this.drawPlayerShape(g, 0, 0, 0, false, 'heavy');
    g.generateTexture('player_attack_heavy', W + 20, H); g.destroy();

    // ── Parry ──
    g = this.add.graphics();
    this.drawPlayerShape(g, 0x000000, 1, 1);
    this.drawPlayerShape(g, 0x000000, -1, 0);
    this.drawPlayerShape(g, 0x000000, 1, 0);
    this.drawPlayerShape(g, 0x000000, 0, 1);
    this.drawPlayerShape(g, 0x000000, 0, -1);
    this.drawPlayerShape(g, 0, 0, 0, false, 'parry');
    g.generateTexture('player_parry', W + 10, H); g.destroy();

    // ── Dodge (ball) ──
    g = this.add.graphics();
    g.fillStyle(0x000000); g.fillEllipse(12, 14, 22, 18);
    g.fillStyle(C.pArmor); g.fillEllipse(11, 13, 20, 16);
    g.fillStyle(C.pArmorHi); g.fillEllipse(9, 11, 10, 8);
    g.fillStyle(C.pArmorLo); g.fillEllipse(14, 15, 8, 6);
    g.generateTexture('player_dodge', 24, 22); g.destroy();

    // ── Heal ──
    g = this.add.graphics();
    this.drawPlayerShape(g, 0x000000, 1, 1);
    this.drawPlayerShape(g, 0x000000, -1, 0);
    this.drawPlayerShape(g, 0x000000, 1, 0);
    this.drawPlayerShape(g, 0x000000, 0, 1);
    this.drawPlayerShape(g, 0x000000, 0, -1);
    this.drawPlayerShape(g, 0, 0, 0, false, 'heal');
    g.generateTexture('player_heal', W, H); g.destroy();
  }

  private drawPlayerShape(
    g: Phaser.GameObjects.Graphics, _outlineColor: number,
    _ox: number, _oy: number, walk: boolean = false, action: string = 'idle'
  ): void {
    // Body
    g.fillStyle(C.pSkin);
    g.fillRect(6, 12, 6, 6); // neck/chin
    g.fillStyle(C.pArmor);
    g.fillRect(4, 4, 12, 14); // torso
    g.fillStyle(C.pArmorHi);
    g.fillRect(5, 5, 5, 6); // chest highlight
    g.fillStyle(C.pArmorLo);
    g.fillRect(4, 16, 12, 2); // belt
    // Helmet
    g.fillStyle(C.pHelm);
    g.fillRect(5, 0, 10, 6);
    g.fillStyle(C.pHelmVisor);
    g.fillRect(8, 2, 5, 2); // visor slit
    g.fillStyle(C.pArmorHi);
    g.fillRect(5, 0, 10, 1); // helm top highlight
    // Cape
    g.fillStyle(C.pCape);
    g.fillRect(16, 4, 4, 16);
    g.fillStyle(C.pCapeHi);
    g.fillRect(17, 5, 2, 10);
    // Legs
    const legOffset = walk ? 2 : 0;
    g.fillStyle(C.pArmorLo);
    g.fillRect(5, 18, 5, 8 + legOffset);
    g.fillRect(11, 18, 5, 8 - legOffset);
    g.fillStyle(C.pBoot);
    g.fillRect(4, 25 + legOffset, 6, 4);
    g.fillRect(10, 25 - legOffset, 6, 4);

    if (action === 'idle' || action === 'light' || action === 'heavy' || action === 'parry') {
      // Sword on back (default)
      if (action === 'idle' || action === 'heal') {
        g.fillStyle(C.pSwordHilt); g.fillRect(2, 2, 3, 3); // pommel
        g.fillStyle(C.pSword); g.fillRect(2, 0, 2, 12); // blade
        g.fillStyle(C.pSwordEdge); g.fillRect(2, 0, 1, 12);
      }
    }

    if (action === 'light') {
      // Sword extended forward
      g.fillStyle(C.pSwordHilt); g.fillRect(18, 6, 3, 4);
      g.fillStyle(C.pSword); g.fillRect(21, 4, 4, 26);
      g.fillStyle(C.pSwordEdge); g.fillRect(22, 4, 2, 26);
      g.fillStyle(C.pSword); g.fillRect(20, 3, 6, 2); // tip
    }

    if (action === 'heavy') {
      // Sword raised high
      g.fillStyle(C.pSwordHilt); g.fillRect(18, 4, 3, 4);
      g.fillStyle(C.pSword); g.fillRect(22, 0, 4, 30);
      g.fillStyle(C.pSwordEdge); g.fillRect(23, 0, 2, 30);
      g.fillStyle(C.pSword); g.fillRect(21, 0, 6, 3);
    }

    if (action === 'parry') {
      // Shield raised
      g.fillStyle(C.pParryShield);
      g.fillRect(18, 2, 5, 14);
      g.fillStyle(0xaaaacc);
      g.fillStyle(C.pArmorHi);
      g.fillRect(19, 3, 3, 12);
      // Sword still visible behind
      g.fillStyle(C.pSword); g.fillRect(2, 2, 2, 10);
    }

    if (action === 'heal') {
      // Flask in hand
      g.fillStyle(C.estusGreen); g.fillRect(0, 8, 4, 8);
      g.fillStyle(0x55dd88); g.fillRect(1, 10, 2, 5);
      g.fillStyle(0x448844); g.fillRect(1, 7, 2, 2); // neck
      g.fillStyle(0x664422); g.fillRect(1, 15, 2, 2); // base
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  HOLLOW — zombie-like enemy
  // ═══════════════════════════════════════════════════════════
  private makeHollow(): void {
    // Idle
    let g = this.add.graphics();
    this.drawHollowShape(g, 0x000000, 1, 0);
    this.drawHollowShape(g, 0x000000, -1, 0);
    this.drawHollowShape(g, 0x000000, 0, 1);
    this.drawHollowShape(g, 0x000000, 0, -1);
    this.drawHollowShape(g, 0, 0, 0, false);
    g.generateTexture('hollow_idle', 22, 26); g.destroy();

    // Attack
    g = this.add.graphics();
    this.drawHollowShape(g, 0x000000, 1, 0);
    this.drawHollowShape(g, 0x000000, -1, 0);
    this.drawHollowShape(g, 0x000000, 0, 1);
    this.drawHollowShape(g, 0x000000, 0, -1);
    this.drawHollowShape(g, 0, 0, 0, true);
    g.generateTexture('hollow_attack', 28, 26); g.destroy();

    // Staggered
    g = this.add.graphics();
    this.drawHollowShape(g, 0x000000, 1, 0);
    this.drawHollowShape(g, 0x000000, -1, 0);
    this.drawHollowShape(g, 0x000000, 0, 1);
    this.drawHollowShape(g, 0x000000, 0, -1);
    this.drawHollowShape(g, 0, 0, 0, false, true);
    g.generateTexture('hollow_stagger', 22, 26); g.destroy();
  }

  private drawHollowShape(g: Phaser.GameObjects.Graphics, _c: number, _ox: number, _oy: number, attacking = false, staggered = false): void {
    // Body (hunched)
    g.fillStyle(C.hRags);
    g.fillRect(3, 4, 12, 14);
    g.fillStyle(C.hBody);
    g.fillRect(4, 5, 10, 12);
    g.fillStyle(C.hBodyShadow);
    g.fillRect(4, 14, 10, 3);
    // Head
    g.fillStyle(C.hSkin);
    g.fillRect(5, 0, 8, 5);
    g.fillStyle(C.hBodyShadow);
    g.fillRect(5, 4, 8, 1); // shadow under head
    // Eyes (glowing)
    g.fillStyle(C.hEyes);
    g.fillRect(6, 1, 2, 2);
    g.fillRect(10, 1, 2, 2);
    if (staggered) {
      // X eyes for stagger
      g.fillStyle(0x000000);
      g.fillRect(6, 1, 1, 1); g.fillRect(7, 2, 1, 1);
      g.fillRect(10, 1, 1, 1); g.fillRect(11, 2, 1, 1);
    }
    // Legs
    g.fillStyle(C.hRags);
    g.fillRect(5, 18, 4, 6);
    g.fillRect(10, 18, 4, 6);
    // Weapon
    if (attacking) {
      g.fillStyle(C.hWeapon); g.fillRect(15, 0, 3, 20);
      g.fillStyle(0x8a8a6a); g.fillRect(16, 0, 1, 20);
    } else {
      g.fillStyle(C.hWeapon); g.fillRect(15, 4, 3, 16);
      g.fillStyle(0x8a8a6a); g.fillRect(16, 4, 1, 16);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  BLACK KNIGHT — armored elite enemy
  // ═══════════════════════════════════════════════════════════
  private makeKnight(): void {
    let g = this.add.graphics();
    this.drawKnightShape(g, 0x000000, 1, 0);
    this.drawKnightShape(g, 0x000000, -1, 0);
    this.drawKnightShape(g, 0x000000, 0, 1);
    this.drawKnightShape(g, 0x000000, 0, -1);
    this.drawKnightShape(g, 0, 0, 0, false, false);
    g.generateTexture('knight_idle', 26, 32); g.destroy();

    g = this.add.graphics();
    this.drawKnightShape(g, 0x000000, 1, 0);
    this.drawKnightShape(g, 0x000000, -1, 0);
    this.drawKnightShape(g, 0x000000, 0, 1);
    this.drawKnightShape(g, 0x000000, 0, -1);
    this.drawKnightShape(g, 0, 0, 0, true, false);
    g.generateTexture('knight_attack', 34, 32); g.destroy();

    g = this.add.graphics();
    this.drawKnightShape(g, 0x000000, 1, 0);
    this.drawKnightShape(g, 0x000000, -1, 0);
    this.drawKnightShape(g, 0x000000, 0, 1);
    this.drawKnightShape(g, 0x000000, 0, -1);
    this.drawKnightShape(g, 0, 0, 0, false, true);
    g.generateTexture('knight_stagger', 26, 32); g.destroy();

    // Blocking
    g = this.add.graphics();
    this.drawKnightShape(g, 0x000000, 1, 0);
    this.drawKnightShape(g, 0x000000, -1, 0);
    this.drawKnightShape(g, 0x000000, 0, 1);
    this.drawKnightShape(g, 0x000000, 0, -1);
    this.drawKnightShape(g, 0, 0, 0, false, false, true);
    g.generateTexture('knight_block', 32, 32); g.destroy();
  }

  private drawKnightShape(g: Phaser.GameObjects.Graphics, _c: number, _ox: number, _oy: number,
    attacking = false, staggered = false, blocking = false): void {
    // Cape
    g.fillStyle(C.bCape); g.fillRect(18, 6, 5, 22);
    g.fillStyle(0x2a1a3a); g.fillRect(19, 7, 3, 16);
    // Body
    g.fillStyle(C.kArmor); g.fillRect(4, 6, 14, 18);
    g.fillStyle(C.kArmorHi); g.fillRect(5, 7, 6, 10);
    g.fillStyle(C.kArmorLo); g.fillRect(4, 22, 14, 2);
    // Helm
    g.fillStyle(C.kArmor); g.fillRect(5, 0, 12, 7);
    g.fillStyle(C.kArmorHi); g.fillRect(6, 0, 10, 2);
    g.fillStyle(C.kPlume); g.fillRect(6, 0, 10, 2); // red plume
    g.fillStyle(C.kArmorHi); g.fillRect(6, 0, 10, 1);
    g.fillStyle(C.kPlume); g.fillRect(10, 0, 2, 3);
    // Eyes
    g.fillStyle(C.kEyes);
    g.fillRect(7, 3, 3, 2); g.fillRect(12, 3, 3, 2);
    if (staggered) {
      g.fillStyle(0x000000);
      g.fillRect(7, 3, 1, 1); g.fillRect(9, 4, 1, 1);
      g.fillRect(12, 3, 1, 1); g.fillRect(14, 4, 1, 1);
    }
    // Legs
    g.fillStyle(C.kArmorLo); g.fillRect(5, 24, 6, 6); g.fillRect(12, 24, 6, 6);
    g.fillStyle(C.kArmor); g.fillRect(5, 28, 6, 2); g.fillRect(12, 28, 6, 2);

    if (blocking) {
      g.fillStyle(C.kShield); g.fillRect(16, 4, 6, 16);
      g.fillStyle(C.kArmorHi); g.fillRect(17, 5, 4, 14);
      g.fillStyle(C.kSword); g.fillRect(2, 8, 3, 18);
    } else if (attacking) {
      g.fillStyle(C.kSword); g.fillRect(18, 0, 4, 28);
      g.fillStyle(0xbbbbcc); g.fillRect(19, 0, 2, 28);
      g.fillStyle(C.kSword); g.fillRect(17, 0, 6, 3);
    } else {
      g.fillStyle(C.kSword); g.fillRect(18, 6, 3, 20);
      g.fillStyle(0xbbbbcc); g.fillRect(19, 6, 1, 20);
      g.fillStyle(C.kShield); g.fillRect(1, 8, 4, 12);
      g.fillStyle(C.kArmorHi); g.fillRect(2, 9, 2, 10);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  BOSS
  // ═══════════════════════════════════════════════════════════
  private makeBoss(): void {
    const BW = 56, BH = 56;
    // Idle
    let g = this.add.graphics();
    this.drawBossShape(g, false, false, false);
    g.generateTexture('boss_idle', BW, BH); g.destroy();

    // Attack
    g = this.add.graphics();
    this.drawBossShape(g, true, false, false);
    g.generateTexture('boss_attack', BW + 10, BH); g.destroy();

    // Enraged
    g = this.add.graphics();
    this.drawBossShape(g, false, true, false);
    g.generateTexture('boss_enraged', BW, BH); g.destroy();

    // Staggered
    g = this.add.graphics();
    this.drawBossShape(g, false, false, true);
    g.generateTexture('boss_stagger', BW, BH); g.destroy();
  }

  private drawBossShape(g: Phaser.GameObjects.Graphics, attacking: boolean, enraged: boolean, staggered: boolean): void {
    const bHorn = enraged ? 0x883333 : C.bHorns;
    const bEye = enraged ? C.bEyesGlow : C.bEyes;

    // Cape
    g.fillStyle(C.bCape); g.fillRect(38, 10, 8, 38);
    g.fillStyle(0x2a0a3a); g.fillRect(39, 12, 5, 30);
    // Body
    g.fillStyle(C.bBody); g.fillRect(10, 8, 28, 34);
    g.fillStyle(C.bArmor); g.fillRect(12, 10, 24, 22);
    g.fillStyle(C.bArmorHi); g.fillRect(13, 11, 10, 14);
    g.fillStyle(C.bArmorLo); g.fillRect(12, 30, 24, 4);
    // Helm
    g.fillStyle(C.bArmor); g.fillRect(14, 0, 22, 10);
    g.fillStyle(C.bArmorHi); g.fillRect(15, 0, 20, 3);
    // Horns
    g.fillStyle(bHorn);
    g.fillRect(12, 0, 5, 8); g.fillRect(34, 0, 5, 8);
    g.fillStyle(0x7a4a4a);
    g.fillRect(13, 0, 3, 6); g.fillRect(35, 0, 3, 6);
    // Eyes
    g.fillStyle(bEye);
    g.fillRect(18, 4, 5, 3); g.fillRect(27, 4, 5, 3);
    // Glow in eyes
    if (enraged) {
      g.fillStyle(0xff8866, 0.4); g.fillRect(17, 3, 7, 5); g.fillRect(26, 3, 7, 5);
    }
    if (staggered) {
      g.fillStyle(0x000000);
      g.fillRect(18, 4, 2, 1); g.fillRect(21, 6, 2, 1);
      g.fillRect(27, 4, 2, 1); g.fillRect(30, 6, 2, 1);
    }
    // Legs
    g.fillStyle(C.bBody); g.fillRect(14, 42, 8, 10); g.fillRect(28, 42, 8, 10);
    g.fillStyle(C.bArmor); g.fillRect(14, 48, 8, 4); g.fillRect(28, 48, 8, 4);

    if (attacking) {
      g.fillStyle(C.bSword); g.fillRect(44, 2, 8, 50);
      g.fillStyle(C.bSwordEdge); g.fillRect(46, 2, 4, 50);
      g.fillStyle(C.bSword); g.fillRect(43, 0, 10, 4);
    } else {
      g.fillStyle(C.bSword); g.fillRect(44, 4, 8, 46);
      g.fillStyle(C.bSwordEdge); g.fillRect(46, 4, 4, 46);
      g.fillStyle(0x552222); g.fillRect(42, 46, 10, 4);
    }

    // Enraged fire aura
    if (enraged) {
      g.fillStyle(0xff4422, 0.15);
      g.fillEllipse(28, 28, 60, 60);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  BONFIRE — larger, more detailed
  // ═══════════════════════════════════════════════════════════
  private makeBonfire(): void {
    const g = this.add.graphics();
    // Stone ring
    g.fillStyle(0x2a2a2a);
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const cx = 20 + Math.cos(angle) * 12;
      const cy = 28 + Math.sin(angle) * 6;
      g.fillRect(cx - 3, cy - 3, 6, 6);
    }
    g.fillStyle(0x3a3a3a);
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const cx = 20 + Math.cos(angle) * 12;
      const cy = 28 + Math.sin(angle) * 6;
      g.fillRect(cx - 2, cy - 3, 4, 3);
    }
    // Ashes
    g.fillStyle(0x333322); g.fillEllipse(20, 30, 28, 10);
    g.fillStyle(0x444433); g.fillEllipse(20, 29, 22, 6);
    // Coals
    g.fillStyle(0x883311);
    g.fillRect(14, 26, 3, 2); g.fillRect(22, 27, 2, 2);
    g.fillRect(18, 25, 2, 2); g.fillRect(25, 26, 2, 2);
    // Sword
    g.fillStyle(0x777777); g.fillRect(18, 4, 3, 22);
    g.fillStyle(0x999999); g.fillRect(19, 4, 1, 22);
    g.fillStyle(0x553311); g.fillRect(15, 24, 9, 3);
    // Flames
    g.fillStyle(C.bonfireRed);
    g.fillTriangle(20, 6, 10, 24, 30, 24);
    g.fillStyle(C.bonfireOrange);
    g.fillTriangle(20, 10, 13, 24, 27, 24);
    g.fillStyle(C.bonfireYellow);
    g.fillTriangle(20, 14, 16, 24, 24, 24);
    g.fillStyle(0xffee88);
    g.fillTriangle(20, 18, 18, 24, 22, 24);
    g.generateTexture('bonfire', 40, 34); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  TORCH — wall-mounted light source
  // ═══════════════════════════════════════════════════════════
  private makeTorch(): void {
    const g = this.add.graphics();
    // Bracket
    g.fillStyle(0x444444); g.fillRect(6, 12, 4, 12);
    g.fillRect(2, 22, 12, 3);
    g.fillStyle(0x555555); g.fillRect(7, 12, 2, 12);
    // Wood
    g.fillStyle(C.torchWood); g.fillRect(5, 2, 6, 12);
    g.fillStyle(0x664422); g.fillRect(6, 2, 4, 12);
    // Flame
    g.fillStyle(C.bonfireRed); g.fillTriangle(8, 0, 2, 8, 14, 8);
    g.fillStyle(C.torchFlame); g.fillTriangle(8, 2, 4, 8, 12, 8);
    g.fillStyle(C.bonfireYellow); g.fillTriangle(8, 4, 5, 8, 11, 8);
    g.generateTexture('torch', 16, 26); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  DECORATIONS — blood stains, bones, cobwebs
  // ═══════════════════════════════════════════════════════════
  private makeDecorations(): void {
    // Blood stain 1
    let g = this.add.graphics();
    g.fillStyle(C.bloodStain, 0.6);
    g.fillEllipse(8, 10, 16, 12);
    g.fillStyle(C.bloodStain, 0.4);
    g.fillEllipse(14, 8, 8, 6);
    g.fillEllipse(4, 14, 10, 6);
    g.generateTexture('blood1', 20, 20); g.destroy();

    // Blood stain 2
    g = this.add.graphics();
    g.fillStyle(C.bloodStain, 0.5);
    g.fillEllipse(6, 6, 12, 8);
    g.fillEllipse(10, 10, 6, 10);
    g.generateTexture('blood2', 16, 16); g.destroy();

    // Bones
    g = this.add.graphics();
    g.fillStyle(C.bone); g.fillRect(0, 2, 12, 3);
    g.fillRect(10, 0, 4, 7); g.fillRect(10, 3, 6, 3);
    g.fillRect(0, 1, 3, 5);
    g.generateTexture('bones', 16, 8); g.destroy();

    // Cobweb (corner)
    g = this.add.graphics();
    g.fillStyle(C.cobweb, 0.4);
    g.fillRect(0, 0, 1, 16); g.fillRect(0, 0, 16, 1);
    g.fillRect(4, 0, 1, 10); g.fillRect(0, 6, 10, 1);
    g.fillRect(8, 0, 1, 6); g.fillRect(0, 10, 6, 1);
    g.generateTexture('cobweb', 16, 16); g.destroy();

    // Torch glow (light overlay)
    g = this.add.graphics();
    g.fillStyle(C.torchGlow, 0.04); g.fillCircle(64, 64, 64);
    g.fillStyle(C.torchGlow, 0.06); g.fillCircle(64, 64, 40);
    g.fillStyle(C.torchGlow, 0.08); g.fillCircle(64, 64, 20);
    g.generateTexture('torch_glow', 128, 128); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  PARTICLES
  // ═══════════════════════════════════════════════════════════
  private makeParticles(): void {
    let g: Phaser.GameObjects.Graphics;

    g = this.add.graphics(); g.fillStyle(C.particle); g.fillRect(0, 0, 5, 5);
    g.fillStyle(0xffcc66); g.fillRect(1, 1, 3, 3);
    g.generateTexture('p_spark', 5, 5); g.destroy();

    g = this.add.graphics(); g.fillStyle(C.blood); g.fillRect(0, 0, 4, 4);
    g.fillStyle(C.bloodBright); g.fillRect(1, 1, 2, 2);
    g.generateTexture('p_blood', 4, 4); g.destroy();

    g = this.add.graphics(); g.fillStyle(C.bonfireOrange); g.fillRect(0, 0, 4, 4);
    g.fillStyle(C.bonfireYellow); g.fillRect(1, 1, 2, 2);
    g.generateTexture('p_ember', 4, 4); g.destroy();

    g = this.add.graphics();
    g.fillStyle(C.soulGlow); g.fillRect(2, 0, 5, 5);
    g.fillRect(0, 2, 9, 5);
    g.fillRect(2, 7, 5, 5);
    g.generateTexture('p_soul', 9, 12); g.destroy();

    g = this.add.graphics(); g.fillStyle(C.estusGreen); g.fillRect(0, 0, 5, 5);
    g.fillStyle(0x66ee88); g.fillRect(1, 1, 3, 3);
    g.generateTexture('p_heal', 5, 5); g.destroy();

    g = this.add.graphics(); g.fillStyle(C.parryFlash); g.fillRect(0, 0, 8, 8);
    g.fillStyle(0xffffcc); g.fillRect(2, 2, 4, 4);
    g.generateTexture('p_parry', 8, 8); g.destroy();

    g = this.add.graphics(); g.fillStyle(C.staggerStar); g.fillRect(2, 0, 4, 4);
    g.fillRect(0, 2, 8, 4);
    g.fillRect(2, 6, 4, 4);
    g.generateTexture('p_stagger', 8, 10); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  UI ELEMENTS
  // ═══════════════════════════════════════════════════════════
  private makeUI(): void {
    // Estus icon
    const g = this.add.graphics();
    g.fillStyle(C.estusGreen); g.fillRect(4, 0, 8, 5);
    g.fillRect(2, 5, 12, 10);
    g.fillRect(4, 15, 8, 5);
    g.fillStyle(0x55dd88); g.fillRect(3, 1, 6, 3);
    g.fillRect(3, 6, 10, 8);
    g.fillStyle(0x448844); g.fillRect(5, 0, 4, 2);
    g.fillStyle(0x664422); g.fillRect(3, 18, 8, 2);
    g.generateTexture('ui_estus', 18, 20); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  SLASH EFFECTS
  // ═══════════════════════════════════════════════════════════
  private makeSlashEffects(): void {
    // Light slash
    let g = this.add.graphics();
    g.fillStyle(0xffffff, 0.5);
    const cx = 4, cy = 18, r = 38;
    for (let a = -1.3; a < 1.3; a += 0.12) {
      g.fillTriangle(cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a + 0.12) * r * 0.4, cy + Math.sin(a + 0.12) * r * 0.4);
    }
    g.generateTexture('slash_light', 44, 36); g.destroy();

    // Heavy slash (bigger, orange tint)
    g = this.add.graphics();
    g.fillStyle(C.heavySlash, 0.6);
    const cx2 = 6, cy2 = 20, r2 = 50;
    for (let a = -1.5; a < 1.5; a += 0.1) {
      g.fillTriangle(cx2, cy2, cx2 + Math.cos(a) * r2, cy2 + Math.sin(a) * r2, cx2 + Math.cos(a + 0.1) * r2 * 0.35, cy2 + Math.sin(a + 0.1) * r2 * 0.35);
    }
    g.generateTexture('slash_heavy', 58, 42); g.destroy();

    // Boss slash
    g = this.add.graphics();
    g.fillStyle(0xff3333, 0.4);
    const cx3 = 8, cy3 = 28, r3 = 60;
    for (let a = -1.0; a < 1.0; a += 0.1) {
      g.fillTriangle(cx3, cy3, cx3 + Math.cos(a) * r3, cy3 + Math.sin(a) * r3, cx3 + Math.cos(a + 0.1) * r3 * 0.3, cy3 + Math.sin(a + 0.1) * r3 * 0.3);
    }
    g.generateTexture('slash_boss', 68, 56); g.destroy();
  }

  // ═══════════════════════════════════════════════════════════
  //  LOCK-ON INDICATOR
  // ═══════════════════════════════════════════════════════════
  private makeLockOnIndicator(): void {
    const g = this.add.graphics();
    const s = 24;
    g.lineStyle(2, C.lockOn);
    // Diamond shape
    g.beginPath();
    g.moveTo(s/2, 0); g.lineTo(s, s/2);
    g.lineTo(s/2, s); g.lineTo(0, s/2);
    g.closePath(); g.strokePath();
    // Inner dot
    g.fillStyle(C.lockOn);
    g.fillCircle(s/2, s/2, 2);
    g.generateTexture('lockon', s, s); g.destroy();
  }
}