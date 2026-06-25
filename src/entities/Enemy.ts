import Phaser from 'phaser';
import {
  ENEMY_SPEED, ENEMY_CHASE_RANGE, ENEMY_ATTACK_RANGE,
  ENEMY_ATTACK_DAMAGE, ENEMY_ATTACK_COOLDOWN, ENEMY_HP,
  ENEMY_SOULS, COLORS,
} from '../utils/constants';

export type EnemyState = 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead';

export class Enemy extends Phaser.GameObjects.Container {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private hp: number = ENEMY_HP;
  private maxHp: number = ENEMY_HP;
  private enemyState: EnemyState = 'idle';
  private facingRight: boolean = true;
  private attackCooldown: number = 0;
  private hurtTimer: number = 0;
  private patrolTarget: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private patrolWaitTimer: number = 0;
  private spawnX: number = 0;
  private spawnY: number = 0;
  private patrolRadius: number = 80;
  private soulsValue: number = ENEMY_SOULS;
  private alive: boolean = true;
  private isAttacking: boolean = false;

  public onDeath?: (x: number, y: number, souls: number) => void;
  public onAttack?: (x: number, y: number, dir: Phaser.Math.Vector2, damage: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRadius: number = 80) {
    super(scene, x, y);
    (scene.add as any).existing(this);
    this.spawnX = x;
    this.spawnY = y;
    this.patrolRadius = patrolRadius;

    this.sprite = scene.physics.add.sprite(0, 0, 'enemy');
    this.sprite.setOrigin(0.5, 0.7);
    this.sprite.setDepth(9);
    this.add(this.sprite);

    this.pickNewPatrolTarget();
    this.enemyState = 'patrol';
  }

  getBody(): Phaser.Physics.Arcade.Sprite { return this.sprite; }
  isAlive(): boolean { return this.alive; }

  update(delta: number, playerX: number, playerY: number): void {
    if (!this.alive) return;
    const dt = delta / 1000;
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.hurtTimer = Math.max(0, this.hurtTimer - delta);

    if (this.hurtTimer > 0) {
      this.sprite.setTint(0xff6666);
      this.sprite.setVelocity(0, 0);
      return;
    } else {
      this.sprite.clearTint();
    }

    if (this.isAttacking) return;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    switch (this.enemyState) {
      case 'patrol':
        this.updatePatrol(dt);
        if (dist < ENEMY_CHASE_RANGE) this.enemyState = 'chase';
        break;
      case 'chase':
        this.updateChase(dx, dy, dist);
        break;
      case 'attack':
        break;
    }
  }

  private updatePatrol(dt: number): void {
    const dx = this.patrolTarget.x - this.x;
    const dy = this.patrolTarget.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      this.patrolWaitTimer -= dt * 1000;
      if (this.patrolWaitTimer <= 0) this.pickNewPatrolTarget();
      this.sprite.setVelocity(0, 0);
    } else {
      const speed = ENEMY_SPEED * 0.5;
      this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
      if (dx > 0) this.facingRight = true;
      else if (dx < 0) this.facingRight = false;
    }
    this.sprite.setFlipX(!this.facingRight);
  }

  private updateChase(dx: number, dy: number, dist: number): void {
    if (dist > ENEMY_CHASE_RANGE * 1.5) {
      this.enemyState = 'patrol';
      this.pickNewPatrolTarget();
      return;
    }
    if (dist < ENEMY_ATTACK_RANGE && this.attackCooldown <= 0) {
      this.performAttack(dx, dy, dist);
      return;
    }
    const speed = ENEMY_SPEED;
    this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    if (dx > 0) this.facingRight = true;
    else if (dx < 0) this.facingRight = false;
    this.sprite.setFlipX(!this.facingRight);
  }

  private performAttack(dx: number, dy: number, dist: number): void {
    this.enemyState = 'attack';
    this.isAttacking = true;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('enemy_attack');

    this.scene.time.delayedCall(300, () => {
      if (!this.alive) return;
      this.sprite.setTexture('enemy');
      if (dist < ENEMY_ATTACK_RANGE * 1.5) {
        const dir = new Phaser.Math.Vector2(dx, dy).normalize();
        if (this.onAttack) {
          this.onAttack(this.x + dir.x * ENEMY_ATTACK_RANGE, this.y + dir.y * ENEMY_ATTACK_RANGE * 0.5, dir, ENEMY_ATTACK_DAMAGE);
        }
      }
      this.attackCooldown = ENEMY_ATTACK_COOLDOWN;
      this.isAttacking = false;
      this.enemyState = 'patrol';
    });
  }

  private pickNewPatrolTarget(): void {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.FloatBetween(20, this.patrolRadius);
    this.patrolTarget.set(this.spawnX + Math.cos(angle) * radius, this.spawnY + Math.sin(angle) * radius);
    this.patrolWaitTimer = Phaser.Math.Between(500, 2000);
  }

  takeDamage(amount: number, knockbackDir?: Phaser.Math.Vector2): void {
    if (!this.alive) return;
    this.hp -= amount;
    this.hurtTimer = 200;
    if (knockbackDir) this.sprite.setVelocity(knockbackDir.x * 200, knockbackDir.y * 200);
    if (this.hp <= 0) this.die();
  }

  die(): void {
    this.alive = false;
    this.enemyState = 'dead';
    this.sprite.setVelocity(0, 0);
    this.sprite.setTint(COLORS.midGray);
    if (this.onDeath) this.onDeath(this.x, this.y, this.soulsValue);
    this.scene.tweens.add({
      targets: this, alpha: 0, duration: 600, delay: 300,
      onComplete: () => this.destroy(),
    });
  }
}