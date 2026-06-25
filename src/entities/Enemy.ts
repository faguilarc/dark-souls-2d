import Phaser from 'phaser';
import {
  HOLLOW_SPEED, HOLLOW_CHASE_RANGE, HOLLOW_ATTACK_RANGE,
  HOLLOW_DAMAGE, HOLLOW_ATK_CD, HOLLOW_HP, HOLLOW_SOULS, HOLLOW_POISE,
  KNIGHT_SPEED, KNIGHT_CHASE_RANGE, KNIGHT_ATTACK_RANGE,
  KNIGHT_DAMAGE, KNIGHT_ATK_CD, KNIGHT_HP, KNIGHT_SOULS, KNIGHT_POISE,
  C,
} from '../utils/constants';

export type EnemyType = 'hollow' | 'knight';
export type EnemyState = 'patrol' | 'chase' | 'attack' | 'staggered' | 'riposte_vulnerable' | 'dead';

export class Enemy extends Phaser.GameObjects.Container {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private hp: number;
  private maxHp: number;
  private enemyState: EnemyState = 'patrol';
  private facingRight = true;
  private atkCd = 0;
  private hurtTimer = 0;
  private staggerTimer = 0;
  private riposteVulnTimer = 0;
  private patrolTarget = new Phaser.Math.Vector2();
  private patrolWait = 0;
  private spawnX: number;
  private spawnY: number;
  private patrolRadius: number;
  private soulsValue: number;
  private alive = true;
  private isAttacking = false;
  private poise: number;
  private maxPoise: number;
  private poiseRegenTimer = 0;
  private type: EnemyType;
  private isBlocking = false;

  public onDeath?: (x: number, y: number, souls: number) => void;
  public onAttack?: (x: number, y: number, dir: Phaser.Math.Vector2, damage: number) => void;
  public onStagger?: (x: number, y: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'hollow', patrolRadius = 80) {
    super(scene, x, y);
    (scene.add as any).existing(this);
    this.spawnX = x; this.spawnY = y; this.patrolRadius = patrolRadius; this.type = type;

    const tex = type === 'knight' ? 'knight_idle' : 'hollow_idle';
    this.sprite = scene.physics.add.sprite(0, 0, tex);
    this.sprite.setOrigin(0.5, 0.75);
    this.sprite.setDepth(9);
    this.add(this.sprite);

    if (type === 'knight') {
      this.hp = KNIGHT_HP; this.maxHp = KNIGHT_HP;
      this.soulsValue = KNIGHT_SOULS; this.poise = KNIGHT_POISE; this.maxPoise = KNIGHT_POISE;
    } else {
      this.hp = HOLLOW_HP; this.maxHp = HOLLOW_HP;
      this.soulsValue = HOLLOW_SOULS; this.poise = HOLLOW_POISE; this.maxPoise = HOLLOW_POISE;
    }

    this.pickPatrol();
  }

  getBody() { return this.sprite; }
  isAlive() { return this.alive; }
  getType() { return this.type; }
  getIsParryable() { return this.isAttacking; }
  getIsStaggered() { return this.enemyState === 'staggered'; }
  getIsRipostable() { return this.enemyState === 'riposte_vulnerable'; }

  update(delta: number, px: number, py: number, playerIsParrying: boolean = false): void {
    if (!this.alive) return;
    const dt = delta / 1000;
    this.atkCd = Math.max(0, this.atkCd - delta);
    this.hurtTimer = Math.max(0, this.hurtTimer - delta);
    this.staggerTimer = Math.max(0, this.staggerTimer - delta);
    this.riposteVulnTimer = Math.max(0, this.riposteVulnTimer - delta);
    this.poiseRegenTimer += delta;

    // Poise regen (slow, out of combat)
    if (this.poiseRegenTimer > 3000 && this.poise < this.maxPoise) {
      this.poise = Math.min(this.maxPoise, this.poise + 5 * dt);
    }

    // Stagger state
    if (this.enemyState === 'staggered') {
      this.sprite.setTint(0xffcc44);
      this.sprite.setVelocity(0, 0);
      if (this.staggerTimer <= 0) {
        this.sprite.clearTint();
        this.setTexture('idle');
        this.enemyState = 'patrol';
        this.pickPatrol();
      }
      return;
    }

    // Riposte vulnerable
    if (this.enemyState === 'riposte_vulnerable') {
      this.sprite.setTint(0xffff88);
      this.sprite.setVelocity(0, 0);
      if (this.riposteVulnTimer <= 0) {
        this.sprite.clearTint();
        this.setTexture('idle');
        this.enemyState = 'staggered';
        this.staggerTimer = 1200;
      }
      return;
    }

    if (this.hurtTimer > 0) { this.sprite.setTint(0xff6666); this.sprite.setVelocity(0, 0); return; }
    else this.sprite.clearTint();
    if (this.isAttacking) return;

    const dx = px - this.x, dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = this.type === 'knight' ? KNIGHT_SPEED : HOLLOW_SPEED;
    const chaseRange = this.type === 'knight' ? KNIGHT_CHASE_RANGE : HOLLOW_CHASE_RANGE;
    const atkRange = this.type === 'knight' ? KNIGHT_ATTACK_RANGE : HOLLOW_ATTACK_RANGE;

    // Knight blocking behavior
    if (this.type === 'knight' && dist < atkRange * 2.5 && dist > atkRange && !playerIsParrying) {
      this.isBlocking = true;
      this.setTexture('block');
    } else {
      this.isBlocking = false;
    }

    switch (this.enemyState) {
      case 'patrol':
        this.updatePatrol(dt);
        if (dist < chaseRange) this.enemyState = 'chase';
        break;
      case 'chase':
        if (dist > chaseRange * 1.5) { this.enemyState = 'patrol'; this.pickPatrol(); return; }
        if (dist < atkRange && this.atkCd <= 0) { this.performAttack(dx, dy, dist); return; }
        this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
        if (dx > 0) this.facingRight = true; else if (dx < 0) this.facingRight = false;
        if (!this.isBlocking) this.setTexture('idle');
        this.sprite.setFlipX(!this.facingRight);
        break;
    }
  }

  private updatePatrol(dt: number): void {
    const dx = this.patrolTarget.x - this.x, dy = this.patrolTarget.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = (this.type === 'knight' ? KNIGHT_SPEED : HOLLOW_SPEED) * 0.4;
    if (dist < 8) {
      this.patrolWait -= dt * 1000;
      if (this.patrolWait <= 0) this.pickPatrol();
      this.sprite.setVelocity(0, 0);
    } else {
      this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
      if (dx > 0) this.facingRight = true; else if (dx < 0) this.facingRight = false;
    }
    this.sprite.setFlipX(!this.facingRight);
    this.setTexture('idle');
  }

  private performAttack(dx: number, dy: number, dist: number): void {
    this.enemyState = 'attack'; this.isAttacking = true; this.isBlocking = false;
    this.sprite.setVelocity(0, 0); this.setTexture('attack');
    const dmg = this.type === 'knight' ? KNIGHT_DAMAGE : HOLLOW_DAMAGE;
    const range = this.type === 'knight' ? KNIGHT_ATTACK_RANGE : HOLLOW_ATTACK_RANGE;
    const cd = this.type === 'knight' ? KNIGHT_ATK_CD : HOLLOW_ATK_CD;

    this.scene.time.delayedCall(this.type === 'knight' ? 400 : 300, () => {
      if (!this.alive) return;
      this.setTexture('idle');
      if (dist < range * 1.8) {
        const dir = new Phaser.Math.Vector2(dx, dy).normalize();
        if (this.onAttack) this.onAttack(this.x + dir.x * range, this.y + dir.y * range * 0.5, dir, dmg);
      }
      this.atkCd = cd; this.isAttacking = false; this.enemyState = 'patrol';
    });
  }

  takeDamage(amount: number, knockbackDir?: Phaser.Math.Vector2): boolean {
    if (!this.alive) return false;

    // Knight blocking reduces damage
    if (this.isBlocking) {
      amount = Math.floor(amount * 0.2);
      this.poise += amount * 0.5;
      this.scene.cameras.main.shake(40, 0.003);
    }

    this.hp -= amount;
    this.hurtTimer = 150;
    this.poiseRegenTimer = 0;
    if (knockbackDir) {
      const kb = this.type === 'knight' ? 100 : 200;
      this.sprite.setVelocity(knockbackDir.x * kb, knockbackDir.y * kb);
    }
    if (this.hp <= 0) { this.die(); return true; }
    return true;
  }

  applyPoiseDamage(amount: number): void {
    this.poise -= amount;
    this.poiseRegenTimer = 0;
    if (this.poise <= 0) {
      this.stagger(amount);
    }
  }

  stagger(damage: number = 0): void {
    if (!this.alive) return;
    this.poise = 0;
    this.enemyState = 'staggered';
    this.staggerTimer = this.type === 'knight' ? 1500 : 1000;
    this.isAttacking = false;
    this.sprite.setVelocity(0, 0);
    this.setTexture('stagger');
    if (this.hp > 0 && damage > 0) {
      this.hp -= damage;
      if (this.hp <= 0) { this.die(); return; }
    }
    if (this.onStagger) this.onStagger(this.x, this.y);
  }

  enterRiposteVulnerable(): void {
    this.enemyState = 'riposte_vulnerable';
    this.riposteVulnTimer = 2000;
    this.isAttacking = false;
    this.sprite.setVelocity(0, 0);
  }

  takeRiposteDamage(damage: number): void {
    if (!this.alive) return;
    this.hp -= damage;
    this.scene.cameras.main.shake(200, 0.012);
    if (this.hp <= 0) { this.die(); return; }
    // Long stagger after riposte
    this.enemyState = 'staggered';
    this.staggerTimer = 2000;
    this.riposteVulnTimer = 0;
    this.setTexture('stagger');
  }

  die(): void {
    this.alive = false; this.enemyState = 'dead';
    this.sprite.setVelocity(0, 0); this.sprite.setTint(C.midGray);
    if (this.onDeath) this.onDeath(this.x, this.y, this.soulsValue);
    this.scene.tweens.add({ targets: this, alpha: 0, duration: 800, delay: 400, onComplete: () => this.destroy() });
  }

  private pickPatrol(): void {
    const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const r = Phaser.Math.FloatBetween(20, this.patrolRadius);
    this.patrolTarget.set(this.spawnX + Math.cos(a) * r, this.spawnY + Math.sin(a) * r);
    this.patrolWait = Phaser.Math.Between(500, 2500);
  }

  private setTexture(state: 'idle' | 'attack' | 'stagger' | 'block'): void {
    const prefix = this.type === 'knight' ? 'knight' : 'hollow';
    if (state === 'idle') this.sprite.setTexture(`${prefix}_idle`);
    else if (state === 'attack') this.sprite.setTexture(`${prefix}_attack`);
    else if (state === 'stagger') this.sprite.setTexture(`${prefix}_stagger`);
    else if (state === 'block' && this.type === 'knight') this.sprite.setTexture('knight_block');
  }
}