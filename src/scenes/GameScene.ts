import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, C,
  PLAYER_ATTACK_RANGE, PLAYER_HEAVY_ATTACK_RANGE,
  PLAYER_RIPOSTE_DAMAGE, HOLLOW_ATTACK_RANGE, KNIGHT_ATTACK_RANGE, BOSS_ATTACK_RANGE,
} from '../utils/constants';

// Bigger, more interesting level: 0=ground, 1=wall, 2=pillar, 3=bonfire, 4=boss, 5=torch
const MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1],
  [1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,1],
  [1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// [tileX, tileY, type, patrolRadius]
const ENEMY_DATA: [number, number, EnemyType, number][] = [
  [6, 2, 'hollow', 60],
  [15, 1, 'hollow', 80],
  [26, 4, 'knight', 70],
  [4, 10, 'hollow', 50],
  [13, 10, 'hollow', 60],
  [22, 11, 'knight', 80],
  [31, 3, 'hollow', 50],
  [5, 15, 'hollow', 60],
  [14, 16, 'knight', 90],
  [25, 15, 'hollow', 70],
  [10, 21, 'hollow', 60],
  [34, 20, 'knight', 80],
  [6, 7, 'hollow', 50],
  [30, 8, 'hollow', 60],
];

const TORCH_POSITIONS: [number, number][] = [
  [11, 2], [12, 2], [19, 1], [19, 2], [4, 4], [9, 13],
  [28, 13], [10, 18], [28, 19], [15, 21],
];

const DECOR_POSITIONS: { x: number; y: number; type: 'blood1' | 'blood2' | 'bones' | 'cobweb' }[] = [
  { x: 8, y: 5, type: 'blood1' }, { x: 25, y: 7, type: 'blood2' },
  { x: 15, y: 12, type: 'bones' }, { x: 30, y: 16, type: 'blood1' },
  { x: 3, y: 3, type: 'cobweb' }, { x: 37, y: 3, type: 'cobweb' },
  { x: 3, y: 22, type: 'cobweb' }, { x: 37, y: 22, type: 'cobweb' },
  { x: 20, y: 5, type: 'blood2' }, { x: 7, y: 18, type: 'bones' },
  { x: 32, y: 11, type: 'blood1' }, { x: 15, y: 7, type: 'bones' },
];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private bonfire!: Phaser.GameObjects.Sprite;
  private bonfirePos = { x: 0, y: 0 };
  private bossSpawnPos = { x: 0, y: 0 };
  private nearBonfire = false;
  private interactText!: Phaser.GameObjects.Text;
  private slashLight?: Phaser.GameObjects.Sprite;
  private slashHeavy?: Phaser.GameObjects.Sprite;
  private slashBoss?: Phaser.GameObjects.Sprite;
  private enemiesKilled = 0;
  private totalEnemies = ENEMY_DATA.length;
  private bossDefeated = false;
  private torchGlows: Phaser.GameObjects.Sprite[] = [];
  private torchEmbers: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  public getPlayer() { return this.player; }
  public getBoss() { return this.boss; }
  public getEnemies() { return this.enemies; }

  constructor() { super({ key: 'GameScene' }); }

  create(): void {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.buildLevel();
    this.spawnPlayer();
    this.spawnEnemies();
    this.setupBonfire();
    this.createAtmosphere();

    this.slashLight = this.add.sprite(0, 0, 'slash_light').setVisible(false).setDepth(15);
    this.slashHeavy = this.add.sprite(0, 0, 'slash_heavy').setVisible(false).setDepth(15);
    this.slashBoss = this.add.sprite(0, 0, 'slash_boss').setVisible(false).setDepth(15);

    this.interactText = this.add.text(0, 0, '[F] Rest at Bonfire', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#8a8a6a',
    }).setOrigin(0.5).setVisible(false).setDepth(25);

    this.scene.launch('HUDScene');
  }

  private buildLevel(): void {
    this.walls = this.physics.add.staticGroup();
    const groundTextures = ['ground1', 'ground2', 'ground3'];

    for (let r = 0; r < MAP.length; r++) {
      for (let c = 0; c < MAP[r].length; c++) {
        const x = c * TILE_SIZE + TILE_SIZE / 2;
        const y = r * TILE_SIZE + TILE_SIZE / 2;
        const t = MAP[r][c];

        if (t === 1) {
          // Use pillar texture for corners/special spots, wall otherwise
          const isPillar = (r === 0 || r === MAP.length - 1) && (c === 0 || c === MAP[0].length - 1);
          const tex = isPillar ? 'wall_pillar' : 'wall';
          const wall = this.walls.create(x, y, tex);
          wall.setDepth(1).setAlpha(0.95);
        } else if (t === 2) {
          const p = this.walls.create(x, y, 'wall_pillar');
          p.setDepth(1);
        } else if (t === 3) {
          this.bonfirePos = { x, y };
        } else if (t === 4) {
          this.bossSpawnPos = { x, y };
        } else if (t === 0) {
          // Random ground variant
          const gTex = groundTextures[Math.floor(Math.random() * 3)];
          this.add.sprite(x, y, gTex).setDepth(0).setAlpha(0.7);
        } else if (t === 5) {
          const gTex = groundTextures[Math.floor(Math.random() * 3)];
          this.add.sprite(x, y, gTex).setDepth(0).setAlpha(0.7);
        }
      }
    }

    // Place torches
    TORCH_POSITIONS.forEach(([tx, ty]) => {
      const x = tx * TILE_SIZE + TILE_SIZE / 2;
      const y = ty * TILE_SIZE + TILE_SIZE / 2;
      this.add.sprite(x, y - 6, 'torch').setDepth(12);
      // Glow
      const glow = this.add.sprite(x, y, 'torch_glow').setDepth(3).setAlpha(0.6).setScale(1.2);
      this.torchGlows.push(glow);
      // Ember particles
      const emitter = this.add.particles(x, y - 10, 'p_ember', {
        speed: { min: 8, max: 30 }, angle: { min: 230, max: 310 },
        scale: { start: 0.8, end: 0 }, alpha: { start: 0.6, end: 0 },
        lifespan: { min: 500, max: 1200 }, frequency: 300, quantity: 1,
      });
      emitter.setDepth(13);
      this.torchEmbers.push(emitter);
    });

    // Place decorations
    DECOR_POSITIONS.forEach(d => {
      const x = d.x * TILE_SIZE + TILE_SIZE / 2;
      const y = d.y * TILE_SIZE + TILE_SIZE / 2;
      this.add.sprite(x, y, d.type).setDepth(2).setAlpha(0.6);
    });

    // Fog patches
    for (let i = 0; i < 30; i++) {
      const rx = Phaser.Math.Between(1, MAP[0].length - 2);
      const ry = Phaser.Math.Between(1, MAP.length - 2);
      if (MAP[ry][rx] === 0 || MAP[ry][rx] === 5) {
        const fog = this.add.sprite(rx * TILE_SIZE + TILE_SIZE / 2, ry * TILE_SIZE + TILE_SIZE / 2, 'fog')
          .setDepth(0).setAlpha(Phaser.Math.FloatBetween(0.05, 0.15)).setScale(1.5 + Math.random());
        this.tweens.add({
          targets: fog, x: fog.x + Phaser.Math.Between(-25, 25),
          alpha: Phaser.Math.FloatBetween(0.03, 0.12),
          duration: Phaser.Math.Between(4000, 10000), yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut', delay: i * 300,
        });
      }
    }

    const mw = MAP[0].length * TILE_SIZE, mh = MAP.length * TILE_SIZE;
    this.physics.world.setBounds(0, 0, mw, mh);
    this.cameras.main.setBounds(0, 0, mw, mh);
  }

  private spawnPlayer(): void {
    this.player = new Player(this, this.bonfirePos.x, this.bonfirePos.y);

    this.player.onAttack = (x, y, dir, damage, isHeavy) => this.handlePlayerAttack(x, y, dir, damage, isHeavy);
    this.player.onParry = () => this.checkParry();
    this.player.onRiposte = (target, dir) => this.performRiposte(target, dir);
    this.player.onHeal = () => this.spawnParticles(this.player.x, this.player.y, 'p_heal', 14, 30, 70, 400, 800);
    this.player.onDeath = () => {
      this.scene.stop('HUDScene');
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(800, () => this.scene.start('DeathScene', { souls: this.player.getSouls() }));
    };
    this.player.onSoulsChanged = (s) => { const h = this.scene.get('HUDScene') as any; if (h?.updateSouls) h.updateSouls(s); };
    this.player.onInteract = () => { if (this.nearBonfire) this.restAtBonfire(); };

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.physics.add.collider(this.player.getBody(), this.walls);
  }

  private spawnEnemies(): void {
    ENEMY_DATA.forEach(([tx, ty, type, patrol]) => {
      const x = tx * TILE_SIZE + TILE_SIZE / 2;
      const y = ty * TILE_SIZE + TILE_SIZE / 2;
      const enemy = new Enemy(this, x, y, type, patrol);

      enemy.onDeath = (ex, ey, souls) => {
        this.spawnParticles(ex, ey, 'p_soul', 12, 25, 100, 600, 1200);
        this.spawnParticles(ex, ey, 'p_blood', 6, 20, 50, 300, 500);
        this.player.addSouls(souls);
        this.enemiesKilled++;
        if (this.enemiesKilled >= Math.floor(this.totalEnemies * 0.7) && !this.boss && !this.bossDefeated) this.spawnBoss();
      };
      enemy.onAttack = (x, y, dir, damage) => {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
        const range = type === 'knight' ? KNIGHT_ATTACK_RANGE : HOLLOW_ATTACK_RANGE;
        if (d < range * 2) { this.player.takeDamage(damage); this.spawnParticles(this.player.x, this.player.y, 'p_blood', 5, 25, 60, 300, 500); }
      };
      enemy.onStagger = (sx, sy) => this.spawnParticles(sx, sy, 'p_stagger', 6, 15, 40, 300, 600);

      this.physics.add.collider(enemy.getBody(), this.walls);
      this.enemies.push(enemy);
    });
  }

  private spawnBoss(): void {
    this.boss = new Boss(this, this.bossSpawnPos.x, this.bossSpawnPos.y);

    this.boss.onDeath = (x, y, souls) => {
      this.bossDefeated = true;
      for (let i = 0; i < 5; i++) this.time.delayedCall(i * 200, () => this.spawnParticles(x + Phaser.Math.Between(-30, 30), y + Phaser.Math.Between(-20, 20), 'p_soul', 10, 30, 120, 600, 1200));
      this.player.addSouls(souls);
      this.cameras.main.flash(1200, 255, 200, 100);
      const h = this.scene.get('HUDScene') as any; if (h?.hideBossHP) h.hideBossHP();
    };
    this.boss.onAttack = (x, y, dir, damage, range, type) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
      if (type === 'aoe') {
        // AOE hits in radius
        const aoeDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss!.x, this.boss!.y);
        if (aoeDist < range) { this.player.takeDamage(damage); this.spawnParticles(this.player.x, this.player.y, 'p_blood', 8, 30, 80, 300, 600); }
      } else if (d < range * 1.5) {
        this.player.takeDamage(damage);
        this.spawnParticles(this.player.x, this.player.y, 'p_blood', 6, 30, 70, 300, 500);
      }
      // Show slash
      if (type === 'slam' || type === 'swing') {
        this.slashBoss!.setPosition(this.player.x, this.player.y).setVisible(true).setFlipX(dir.x < 0);
        this.time.delayedCall(250, () => this.slashBoss!.setVisible(false));
      }
      if (type === 'aoe') {
        // Show expanding circle
        const circle = this.add.graphics().setDepth(15);
        circle.lineStyle(3, 0xff4422, 0.8);
        this.tweens.add({ targets: circle, scaleX: 3, scaleY: 3, alpha: 0, duration: 500, onComplete: () => circle.destroy() });
        circle.setPosition(this.boss!.x, this.boss!.y);
        circle.strokeCircle(0, 0, 30);
      }
    };
    this.boss.onPhaseChange = (phase) => {
      const h = this.scene.get('HUDScene') as any;
      if (h?.updateBossPhase) h.updateBossPhase(phase);
      this.cameras.main.flash(500, 255, 50, 50);
      if (phase === 2) this.spawnParticles(this.boss!.x, this.boss!.y, 'p_ember', 20, 30, 100, 400, 1000);
    };

    this.physics.add.collider(this.boss.getBody(), this.walls);
    this.boss.activate();
    const h = this.scene.get('HUDScene') as any;
    if (h?.showBossHP) h.showBossHP(this.boss.getName(), this.boss.getMaxHP());
  }

  private setupBonfire(): void {
    this.bonfire = this.add.sprite(this.bonfirePos.x, this.bonfirePos.y, 'bonfire').setDepth(5);
    const glow = this.add.graphics().setDepth(4);
    glow.fillStyle(C.bonfireOrange, 0.06); glow.fillCircle(0, 0, 60);
    glow.setPosition(this.bonfirePos.x, this.bonfirePos.y);
    this.tweens.add({ targets: glow, alpha: 0.5, scaleX: 1.3, scaleY: 1.3, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const emitter = this.add.particles(this.bonfirePos.x, this.bonfirePos.y - 10, 'p_ember', {
      speed: { min: 12, max: 50 }, angle: { min: 220, max: 320 },
      scale: { start: 1.2, end: 0 }, alpha: { start: 0.9, end: 0 },
      lifespan: { min: 700, max: 1800 }, frequency: 150, quantity: 1,
    });
    emitter.setDepth(6);
  }

  private createAtmosphere(): void {
    // Torch glow pulsing
    this.torchGlows.forEach((glow, i) => {
      this.tweens.add({
        targets: glow, alpha: 0.4, scaleX: 1.1, scaleY: 1.1,
        duration: Phaser.Math.Between(1500, 3000), yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut', delay: i * 200,
      });
    });

    // Vignette overlay
    const vig = this.add.graphics().setDepth(50).setScrollFactor(0);
    this.cameras.main.on('cameraupdate', () => {
      vig.clear();
      vig.fillStyle(0x000000, 0.4); vig.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      for (let r = 160; r < 480; r += 25) {
        const a = Math.min(0.12, (r - 160) / 3000);
        vig.lineStyle(28, 0x000000, a); vig.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, r);
      }
    });
  }

  // ─── Combat Systems ────────────────────────────────────
  private handlePlayerAttack(x: number, y: number, dir: Phaser.Math.Vector2, damage: number, isHeavy: boolean): void {
    const slash = isHeavy ? this.slashHeavy! : this.slashLight!;
    slash.setPosition(this.player.x + dir.x * 28, this.player.y - 5).setVisible(true).setFlipX(dir.x < 0);
    this.time.delayedCall(isHeavy ? 200 : 120, () => slash.setVisible(false));

    const range = isHeavy ? PLAYER_HEAVY_ATTACK_RANGE : PLAYER_ATTACK_RANGE;

    this.enemies.forEach(e => {
      if (!e.isAlive()) return;
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
      if (d < range * 1.3) {
        const kb = dir.clone().scale(isHeavy ? 250 : 180);
        const killed = e.takeDamage(damage, kb);
        if (isHeavy) e.applyPoiseDamage(damage * 0.8);
        else e.applyPoiseDamage(damage * 0.5);
        this.spawnParticles(e.x, e.y, 'p_spark', 10, 40, 120, 200, 400);
        this.spawnParticles(e.x, e.y, 'p_blood', 4, 20, 60, 250, 500);
        if (isHeavy) this.scene.cameras.main.shake(80, 0.006);
      }
    });

    if (this.boss && this.boss.isAlive()) {
      const d = Phaser.Math.Distance.Between(x, y, this.boss.x, this.boss.y);
      if (d < range * 2.2) {
        const kb = dir.clone().scale(60);
        this.boss.takeDamage(damage, kb);
        if (isHeavy) this.boss.applyPoiseDamage(damage * 0.4);
        else this.boss.applyPoiseDamage(damage * 0.2);
        this.spawnParticles(this.boss.x, this.boss.y, 'p_spark', 12, 50, 140, 200, 400);
        const h = this.scene.get('HUDScene') as any;
        if (h?.updateBossHP) h.updateBossHP(this.boss.getHP());
      }
    }
  }

  private checkParry(): void {
    if (!this.player.getIsParrying()) return;

    const allTargets = [...this.enemies, this.boss].filter((e: any) => e && e.isAlive && e.isAlive()) as any[];
    for (const target of allTargets) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
      const range = (target as Enemy).getType ? 50 : 65;
      const isParryable = (target as any).getIsParryable?.() || target.isAttacking;

      if (d < range && isParryable) {
        // Successful parry!
        this.spawnParticles(this.player.x, this.player.y, 'p_parry', 10, 20, 60, 200, 500);
        this.scene.cameras.main.shake(150, 0.01);
        this.scene.cameras.main.flash(100, 255, 255, 200, true);

        if ((target as Enemy).stagger) {
          (target as Enemy).stagger();
          (target as Enemy).enterRiposteVulnerable();
        } else if ((target as Boss).staggerBoss) {
          (target as Boss).staggerBoss();
        }
        this.player.onParrySuccess(target);
        return;
      }
    }
  }

  private performRiposte(target: any, dir: Phaser.Math.Vector2): void {
    const isBoss = target instanceof Boss;
    const damage = isBoss ? PLAYER_RIPOSTE_DAMAGE * 1.5 : PLAYER_RIPOSTE_DAMAGE;

    this.spawnParticles(target.x, target.y, 'p_spark', 16, 30, 100, 200, 400);
    this.scene.cameras.main.shake(250, 0.015);
    this.scene.cameras.main.flash(120, 255, 255, 200, true);

    this.time.delayedCall(300, () => {
      if (isBoss) {
        (target as Boss).takeRiposteDamage(damage);
        const h = this.scene.get('HUDScene') as any;
        if (h?.updateBossHP) h.updateBossHP((target as Boss).getHP());
      } else {
        (target as Enemy).takeRiposteDamage(damage);
        this.spawnParticles(target.x, target.y, 'p_blood', 8, 30, 80, 300, 600);
      }
    });
  }

  // ─── Particle Helper ───────────────────────────────────
  private spawnParticles(x: number, y: number, tex: string, count: number, minSpd: number, maxSpd: number, minLife: number, maxLife: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.add.sprite(x + Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-8, 8), tex).setDepth(22);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(minSpd, maxSpd);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 15,
        alpha: 0, scale: 0.2,
        duration: Phaser.Math.Between(minLife, maxLife),
        delay: i * 30,
        onComplete: () => p.destroy(),
      });
    }
  }

  // ─── Bonfire ───────────────────────────────────────────
  private restAtBonfire(): void {
    if (!this.nearBonfire) return;
    this.player.setResting(true);
    this.enemies.forEach(e => { if (e.isAlive()) e.destroy(); });
    this.enemies = []; this.enemiesKilled = 0;
    this.spawnEnemies();
    if (this.boss) { this.boss.destroy(); this.boss = null; }
    this.bossDefeated = false;
    const h = this.scene.get('HUDScene') as any; if (h?.hideBossHP) h.hideBossHP();

    const txt = this.add.text(this.player.x, this.player.y - 40, 'BONFIRE LIT', {
      fontSize: '26px', fontFamily: 'Georgia, serif', color: '#ddaa33', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.tweens.add({ targets: txt, alpha: 1, y: this.player.y - 65, duration: 1200, hold: 1800, yoyo: true, onComplete: () => { txt.destroy(); this.player.setResting(false); } });
  }

  // ─── Update ────────────────────────────────────────────
  update(_time: number, delta: number): void {
    if (!this.player || this.player.getState() === 'dead') return;

    this.player.update(delta, this.enemies, this.boss);

    const distBonfire = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.bonfirePos.x, this.bonfirePos.y);
    this.nearBonfire = distBonfire < 55 && !this.player.isResting();
    this.interactText.setVisible(this.nearBonfire);
    if (this.nearBonfire) this.interactText.setPosition(this.bonfirePos.x, this.bonfirePos.y + 35);

    this.enemies.forEach(e => { if (e.isAlive()) e.update(delta, this.player.x, this.player.y, this.player.getIsParrying()); });

    if (this.boss && this.boss.isAlive()) {
      this.boss.update(delta, this.player.x, this.player.y, this.player.getIsParrying());
      const h = this.scene.get('HUDScene') as any;
      if (h?.updateBossHP) h.updateBossHP(this.boss.getHP());
    }

    const h = this.scene.get('HUDScene') as any;
    if (h?.updatePlayerStats) h.updatePlayerStats(this.player.getHP(), this.player.getMaxHP(), this.player.getStamina(), this.player.getMaxStamina(), this.player.getEstus(), this.player.getMaxEstus(), this.player.getSouls());
  }
}