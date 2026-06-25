import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, COLORS,
  PLAYER_ATTACK_RANGE, ENEMY_ATTACK_RANGE, BOSS_ATTACK_RANGE,
  KEYS,
} from '../utils/constants';

// Level map: 0=ground, 1=wall, 2=fog(decorative), 3=bonfire spot, 4=boss spawn
const LEVEL_MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,0,0,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Enemy spawn positions [tileX, tileY, patrolRadius]
const ENEMY_SPAWNS: [number, number, number][] = [
  [6, 5, 60],
  [13, 3, 80],
  [14, 9, 60],
  [4, 10, 50],
  [22, 5, 70],
  [26, 8, 60],
  [10, 14, 80],
  [18, 13, 60],
  [6, 16, 50],
  [24, 16, 60],
];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private boss!: Boss | null;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private bonfire!: Phaser.GameObjects.Sprite;
  private bonfirePos: { x: number; y: number } = { x: 0, y: 0 };
  private bossSpawnPos: { x: number; y: number } = { x: 0, y: 0 };
  private nearBonfire: boolean = false;
  private interactText!: Phaser.GameObjects.Text;
  private fogTiles: Phaser.GameObjects.Sprite[] = [];
  private bonfireParticles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private slashEffect?: Phaser.GameObjects.Sprite;
  private bossSlashEffect?: Phaser.GameObjects.Sprite;
  private enemiesKilled: number = 0;
  private totalEnemies: number = ENEMY_SPAWNS.length;
  private bossDefeated: boolean = false;

  // Pass to HUD
  public getPlayer(): Player { return this.player; }
  public getBoss(): Boss | null { return this.boss; }

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Camera fade in
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Build the level
    this.buildLevel();

    // Spawn player at bonfire
    this.spawnPlayer();

    // Spawn enemies
    this.spawnEnemies();

    // Setup combat collision
    this.setupCombat();

    // Bonfire interaction
    this.setupBonfire();

    // Atmospheric effects
    this.createAtmosphere();

    // Slash effects (pooled)
    this.slashEffect = this.add.sprite(0, 0, 'slash_effect').setVisible(false).setDepth(15);
    this.bossSlashEffect = this.add.sprite(0, 0, 'boss_slash_effect').setVisible(false).setDepth(15);

    // Interact text
    this.interactText = this.add.text(0, 0, '[F] Rest at Bonfire', {
      fontSize: '13px', fontFamily: 'Georgia, serif', color: '#8a8a6a',
    }).setOrigin(0.5).setVisible(false).setDepth(20);

    // Start HUD
    this.scene.launch('HUDScene');

    // Boss gate
    this.boss = null;
  }

  private buildLevel(): void {
    this.walls = this.physics.add.staticGroup();

    for (let row = 0; row < LEVEL_MAP.length; row++) {
      for (let col = 0; col < LEVEL_MAP[row].length; col++) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        const tile = LEVEL_MAP[row][col];

        if (tile === 1) {
          const wall = this.walls.create(x, y, 'tile_wall');
          wall.setDepth(1);
          wall.setAlpha(0.95);
        } else if (tile === 2) {
          const fog = this.add.sprite(x, y, 'tile_fog').setDepth(0).setAlpha(0.3);
          this.fogTiles.push(fog);
        } else if (tile === 3) {
          this.bonfirePos = { x, y };
        } else if (tile === 4) {
          this.bossSpawnPos = { x, y };
        }
      }
    }

    // Add ambient fog in random ground tiles
    for (let i = 0; i < 20; i++) {
      const rx = Phaser.Math.Between(1, LEVEL_MAP[0].length - 2);
      const ry = Phaser.Math.Between(1, LEVEL_MAP.length - 2);
      if (LEVEL_MAP[ry][rx] === 0) {
        const fog = this.add.sprite(
          rx * TILE_SIZE + TILE_SIZE / 2,
          ry * TILE_SIZE + TILE_SIZE / 2,
          'tile_fog'
        ).setDepth(0).setAlpha(0.15).setScale(1.5);
        this.fogTiles.push(fog);
      }
    }

    // Set world bounds
    const mapWidth = LEVEL_MAP[0].length * TILE_SIZE;
    const mapHeight = LEVEL_MAP.length * TILE_SIZE;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
  }

  private spawnPlayer(): void {
    this.player = new Player(this, this.bonfirePos.x, this.bonfirePos.y);

    // Player combat callbacks
    this.player.onAttack = (x, y, dir, damage) => {
      this.handlePlayerAttack(x, y, dir, damage);
    };
    this.player.onHeal = (amount) => {
      this.spawnHealParticles(this.player.x, this.player.y);
    };
    this.player.onDeath = () => {
      this.scene.stop('HUDScene');
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start('DeathScene', {
          souls: this.player.getSouls(),
        });
      });
    };
    this.player.onSoulsChanged = (souls) => {
      const hud = this.scene.get('HUDScene') as any;
      if (hud && hud.updateSouls) hud.updateSouls(souls);
    };
    this.player.onInteract = () => {
      if (this.nearBonfire) {
        this.restAtBonfire();
      }
    };

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Collide player with walls
    this.physics.add.collider(this.player.getBody(), this.walls);
  }

  private spawnEnemies(): void {
    ENEMY_SPAWNS.forEach(([tx, ty, patrol]) => {
      const x = tx * TILE_SIZE + TILE_SIZE / 2;
      const y = ty * TILE_SIZE + TILE_SIZE / 2;
      const enemy = new Enemy(this, x, y, patrol);

      enemy.onDeath = (ex, ey, souls) => {
        this.spawnSoulParticles(ex, ey);
        this.player.addSouls(souls);
        this.enemiesKilled++;

        // Spawn boss when enough enemies killed
        if (this.enemiesKilled >= Math.floor(this.totalEnemies * 0.7) && !this.boss && !this.bossDefeated) {
          this.spawnBoss();
        }
      };

      enemy.onAttack = (x, y, dir, damage) => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
        if (dist < ENEMY_ATTACK_RANGE * 1.5) {
          this.player.takeDamage(damage);
          this.spawnBloodParticles(this.player.x, this.player.y);
        }
      };

      this.physics.add.collider(enemy.getBody(), this.walls);
      this.enemies.push(enemy);
    });
  }

  private spawnBoss(): void {
    this.boss = new Boss(this, this.bossSpawnPos.x, this.bossSpawnPos.y);

    this.boss.onDeath = (x, y, souls) => {
      this.bossDefeated = true;
      this.spawnSoulParticles(x, y, 20);
      this.spawnSoulParticles(x - 20, y, 15);
      this.spawnSoulParticles(x + 20, y, 15);
      this.player.addSouls(souls);
      this.cameras.main.flash(1000, 255, 200, 100);
      const hud = this.scene.get('HUDScene') as any;
      if (hud && hud.hideBossHP) hud.hideBossHP();
    };

    this.boss.onAttack = (x, y, dir, damage, range) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, x, y);
      if (dist < range * 1.5) {
        this.player.takeDamage(damage);
        this.spawnBloodParticles(this.player.x, this.player.y);
        // Show boss slash
        this.bossSlashEffect!.setPosition(this.player.x, this.player.y).setVisible(true);
        this.bossSlashEffect!.setFlipX(dir.x < 0);
        this.time.delayedCall(200, () => this.bossSlashEffect!.setVisible(false));
      }
    };

    this.boss.onPhaseChange = (phase) => {
      const hud = this.scene.get('HUDScene') as any;
      if (hud && hud.updateBossPhase) hud.updateBossPhase(phase);
      // Screen effect for phase 2
      this.cameras.main.flash(500, 255, 50, 50);
    };

    this.physics.add.collider(this.boss.getBody(), this.walls);
    this.boss.activate();

    // Show boss HP bar
    const hud = this.scene.get('HUDScene') as any;
    if (hud && hud.showBossHP) hud.showBossHP(this.boss.getName(), this.boss.getMaxHP());
  }

  private setupCombat(): void {
    // Player body vs enemy bodies
    // (handled via callbacks)
  }

  private setupBonfire(): void {
    this.bonfire = this.add.sprite(this.bonfirePos.x, this.bonfirePos.y, 'bonfire').setDepth(5);

    // Bonfire glow
    const glow = this.add.graphics().setDepth(4);
    glow.fillStyle(0xff8833, 0.08);
    glow.fillCircle(0, 0, 50);
    glow.setPosition(this.bonfirePos.x, this.bonfirePos.y);

    // Animate bonfire glow
    this.tweens.add({
      targets: glow,
      alpha: 0.5,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Bonfire ember particles
    const emitter = this.add.particles(this.bonfirePos.x, this.bonfirePos.y - 8, 'particle_ember', {
      speed: { min: 10, max: 40 },
      angle: { min: 220, max: 320 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: 600, max: 1500 },
      frequency: 200,
      quantity: 1,
    });
    emitter.setDepth(6);
  }

  private createAtmosphere(): void {
    // Fog animation
    this.fogTiles.forEach((fog, i) => {
      this.tweens.add({
        targets: fog,
        x: fog.x + Phaser.Math.Between(-20, 20),
        alpha: Phaser.Math.FloatBetween(0.05, 0.2),
        duration: Phaser.Math.Between(3000, 8000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 200,
      });
    });

    // Ambient light/vignette via camera
    // (Using a dark overlay that follows the camera)
    const vignette = this.add.graphics().setDepth(50).setScrollFactor(0);
    // We'll redraw it on camera move
    this.cameras.main.on('cameraupdate', () => {
      vignette.clear();
      vignette.fillStyle(0x000000, 0.35);
      vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      // Lighter center
      vignette.fillStyle(0x000000, 0);
      vignette.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 200);
      // Gradient rings
      for (let r = 200; r < 450; r += 30) {
        const alpha = Math.min(0.15, (r - 200) / 2500);
        vignette.lineStyle(30, 0x000000, alpha);
        vignette.strokeCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, r);
      }
    });
  }

  private handlePlayerAttack(
    hitX: number, hitY: number,
    dir: Phaser.Math.Vector2, damage: number
  ): void {
    // Show slash effect
    this.slashEffect!.setPosition(this.player.x + dir.x * 25, this.player.y - 5).setVisible(true);
    this.slashEffect!.setFlipX(dir.x < 0);
    this.time.delayedCall(150, () => this.slashEffect!.setVisible(false));

    // Check enemy hits
    this.enemies.forEach(enemy => {
      if (!enemy.isAlive()) return;
      const dist = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
      if (dist < PLAYER_ATTACK_RANGE * 1.2) {
        const knockback = new Phaser.Math.Vector2(dir.x * 200, dir.y * 200);
        enemy.takeDamage(damage, knockback);
        this.spawnHitParticles(enemy.x, enemy.y);
        this.spawnBloodParticles(enemy.x, enemy.y);
      }
    });

    // Check boss hit
    if (this.boss && this.boss.isAlive()) {
      const dist = Phaser.Math.Distance.Between(hitX, hitY, this.boss.x, this.boss.y);
      if (dist < PLAYER_ATTACK_RANGE * 2) {
        const knockback = new Phaser.Math.Vector2(dir.x * 80, dir.y * 80);
        this.boss.takeDamage(damage, knockback);
        this.spawnHitParticles(this.boss.x, this.boss.y);

        // Update boss HP in HUD
        const hud = this.scene.get('HUDScene') as any;
        if (hud && hud.updateBossHP) hud.updateBossHP(this.boss.getHP());

        // Phase change check is handled in boss
        const hudPhase = this.scene.get('HUDScene') as any;
        if (hudPhase && hudPhase.updateBossPhase && this.boss.getPhase() === 2) {
          hudPhase.updateBossPhase(2);
        }
      }
    }
  }

  // ─── Particles ─────────────────────────────────────────
  private spawnHitParticles(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const p = this.add.sprite(x, y, 'particle_spark').setDepth(20);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(40, 120);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(200, 400),
        onComplete: () => p.destroy(),
      });
    }
  }

  private spawnBloodParticles(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const p = this.add.sprite(x, y, 'particle_blood').setDepth(20);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(30, 80);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 20,
        alpha: 0,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => p.destroy(),
      });
    }
  }

  private spawnSoulParticles(x: number, y: number, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      const p = this.add.sprite(
        x + Phaser.Math.Between(-20, 20),
        y + Phaser.Math.Between(-20, 20),
        'particle_soul'
      ).setDepth(20).setScale(0.8);

      this.tweens.add({
        targets: p,
        y: y - Phaser.Math.Between(40, 100),
        alpha: 0,
        duration: Phaser.Math.Between(600, 1200),
        delay: i * 50,
        onComplete: () => p.destroy(),
      });
    }
  }

  private spawnHealParticles(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const p = this.add.sprite(
        x + Phaser.Math.Between(-15, 15),
        y + Phaser.Math.Between(-10, 10),
        'particle_heal'
      ).setDepth(20);

      this.tweens.add({
        targets: p,
        y: y - Phaser.Math.Between(20, 60),
        alpha: 0,
        duration: Phaser.Math.Between(400, 800),
        delay: i * 40,
        onComplete: () => p.destroy(),
      });
    }
  }

  // ─── Bonfire Rest ──────────────────────────────────────
  private restAtBonfire(): void {
    if (!this.nearBonfire) return;

    this.player.setResting(true);

    // Stop enemies / reset level
    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.destroy();
      }
    });
    this.enemies = [];
    this.enemiesKilled = 0;

    // Respawn enemies
    this.spawnEnemies();

    // Reset boss if defeated
    if (this.bossDefeated) {
      this.bossDefeated = false;
    }
    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }

    const hud = this.scene.get('HUDScene') as any;
    if (hud && hud.hideBossHP) hud.hideBossHP();

    // Show "YOU DIED" style text but positive
    const restText = this.add.text(this.player.x, this.player.y - 40, 'BONFIRE LIT', {
      fontSize: '24px', fontFamily: 'Georgia, serif', color: '#ddaa33',
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    this.tweens.add({
      targets: restText,
      alpha: 1,
      y: this.player.y - 60,
      duration: 1000,
      hold: 1500,
      yoyo: true,
      onComplete: () => {
        restText.destroy();
        this.player.setResting(false);
      },
    });
  }

  // ─── Update ────────────────────────────────────────────
  update(_time: number, delta: number): void {
    if (!this.player || this.player.getState() === 'dead') return;

    // Update player
    this.player.update(delta);

    // Check bonfire proximity
    const distToBonfire = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.bonfirePos.x, this.bonfirePos.y
    );
    this.nearBonfire = distToBonfire < 50 && !this.player.isResting();
    this.interactText.setVisible(this.nearBonfire);
    if (this.nearBonfire) {
      this.interactText.setPosition(this.bonfirePos.x, this.bonfirePos.y + 30);
    }

    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.isAlive()) {
        enemy.update(delta, this.player.x, this.player.y);
      }
    });

    // Update boss
    if (this.boss && this.boss.isAlive()) {
      this.boss.update(delta, this.player.x, this.player.y);
      // Update boss HP in HUD
      const hud = this.scene.get('HUDScene') as any;
      if (hud && hud.updateBossHP) hud.updateBossHP(this.boss.getHP());
    }

    // Update HUD
    const hud = this.scene.get('HUDScene') as any;
    if (hud && hud.updatePlayerStats) {
      hud.updatePlayerStats(
        this.player.getHP(),
        this.player.getMaxHP(),
        this.player.getStamina(),
        this.player.getMaxStamina(),
        this.player.getEstus(),
        this.player.getMaxEstus(),
        this.player.getSouls()
      );
    }
  }
}