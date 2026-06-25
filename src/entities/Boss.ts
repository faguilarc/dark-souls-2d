import Phaser from 'phaser';
import {
  BOSS_SPEED, BOSS_CHASE_RANGE, BOSS_ATTACK_RANGE,
  BOSS_ATTACK_DAMAGE, BOSS_ATTACK_COOLDOWN, BOSS_HP,
  BOSS_SOULS, COLORS,
} from '../utils/constants';

export type BossState = 'idle' | 'chase' | 'attack_slam' | 'attack_swing' | 'hurt' | 'dead' | 'enraged';

export class Boss extends Phaser.GameObjects.Container {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private hp: number = BOSS_HP;
  private maxHp: number = BOSS_HP;
  private bossState: BossState = 'idle';
  private facingRight: boolean = true;
  private attackCooldown: number = 0;
  private hurtTimer: number = 0;
  private phase: number = 1;
  private alive: boolean = true;
  private idleTimer: number = 2000;
  private isAttacking: boolean = false;

  public onDeath?: (x: number, y: number, souls: number) => void;
  public onAttack?: (x: number, y: number, dir: Phaser.Math.Vector2, damage: number, range: number) => void;
  public onPhaseChange?: (phase: number) => void;

  public getHP(): number { return this.hp; }
  public getMaxHP(): number { return this.maxHp; }
  public isAlive(): boolean { return this.alive; }
  public getPhase(): number { return this.phase; }
  public getName(): string { return 'THE ASHEN LORD'; }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    (scene.add as any).existing(this);

    this.sprite = scene.physics.add.sprite(0, 0, 'boss');
    this.sprite.setOrigin(0.5, 0.7);
    this.sprite.setDepth(9);
    this.add(this.sprite);
    this.bossState = 'idle';
    this.sprite.setVelocity(0, 0);
  }

  getBody(): Phaser.Physics.Arcade.Sprite { return this.sprite; }

  activate(): void { this.bossState = 'chase'; }

  update(delta: number, playerX: number, playerY: number): void {
    if (!this.alive) return;
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.hurtTimer = Math.max(0, this.hurtTimer - delta);

    if (this.phase === 1 && this.hp <= this.maxHp * 0.5) {
      this.phase = 2;
      this.bossState = 'enraged';
      this.sprite.setTint(0xff6666);
      if (this.onPhaseChange) this.onPhaseChange(2);
      this.scene.cameras.main.shake(400, 0.015);
      this.scene.time.delayedCall(1000, () => { if (this.alive) this.bossState = 'chase'; });
      return;
    }

    if (this.hurtTimer > 0) { this.sprite.setVelocity(0, 0); return; }
    if (this.isAttacking) return;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    switch (this.bossState) {
      case 'idle':
        this.sprite.setVelocity(0, 0);
        this.idleTimer -= delta;
        if (this.idleTimer <= 0) this.bossState = 'chase';
        break;
      case 'enraged':
        this.sprite.setVelocity(0, 0);
        break;
      case 'chase':
        this.updateChase(dx, dy, dist);
        break;
    }
  }

  private updateChase(dx: number, dy: number, dist: number): void {
    if (dist < BOSS_ATTACK_RANGE && this.attackCooldown <= 0) {
      const useSwing = this.phase === 2 && Math.random() > 0.5;
      this.performAttack(dx, dy, useSwing);
      return;
    }
    const speed = BOSS_SPEED * (this.phase === 2 ? 1.3 : 1);
    if (dist > 0) {
      this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
      if (dx > 0) this.facingRight = true;
      else if (dx < 0) this.facingRight = false;
    }
    this.sprite.setFlipX(!this.facingRight);
  }

  private performAttack(dx: number, dy: number, isSwing: boolean): void {
    this.isAttacking = true;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('boss_attack');

    const dir = new Phaser.Math.Vector2(dx, dy).normalize();
    const dmg = this.phase === 2 ? BOSS_ATTACK_DAMAGE * 1.3 : BOSS_ATTACK_DAMAGE;
    const range = isSwing ? BOSS_ATTACK_RANGE * 1.8 : BOSS_ATTACK_RANGE;

    this.scene.time.delayedCall(400, () => {
      if (!this.alive) return;
      if (this.onAttack) this.onAttack(this.x + dir.x * range, this.y + dir.y * range * 0.5, dir, dmg, range);
      this.scene.cameras.main.shake(200, 0.01);
    });

    this.scene.time.delayedCall(800, () => {
      if (!this.alive) return;
      this.sprite.setTexture('boss');
      this.bossState = 'chase';
      this.isAttacking = false;
      this.attackCooldown = BOSS_ATTACK_COOLDOWN * (this.phase === 2 ? 0.7 : 1);
    });
  }

  takeDamage(amount: number, knockbackDir?: Phaser.Math.Vector2): void {
    if (!this.alive) return;
    this.hp -= amount;
    this.hurtTimer = 150;
    if (knockbackDir) this.sprite.setVelocity(knockbackDir.x * 80, knockbackDir.y * 80);
    if (this.hp <= 0) this.die();
  }

  die(): void {
    this.alive = false;
    this.bossState = 'dead';
    this.sprite.setVelocity(0, 0);
    this.scene.cameras.main.shake(600, 0.02);
    if (this.onDeath) {
      this.scene.time.delayedCall(1000, () => this.onDeath(this.x, this.y, BOSS_SOULS));
    }
    this.scene.tweens.add({
      targets: this, alpha: 0, duration: 2000, delay: 800,
      onComplete: () => this.destroy(),
    });
  }
}