import Phaser from 'phaser';
import {
  BOSS_SPEED, BOSS_CHASE_RANGE, BOSS_ATTACK_RANGE,
  BOSS_DAMAGE, BOSS_DAMAGE_P2, BOSS_ATK_CD, BOSS_HP, BOSS_SOULS, BOSS_POISE, C,
} from '../utils/constants';

export type BossAttack = 'slam' | 'swing' | 'leap' | 'aoe';

export class Boss extends Phaser.GameObjects.Container {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private hp = BOSS_HP;
  private maxHp = BOSS_HP;
  private bossState: string = 'idle';
  private facingRight = true;
  private atkCd = 0;
  private hurtTimer = 0;
  private phase = 1;
  private alive = true;
  private isAttacking = false;
  private poise = BOSS_POISE;
  private staggerTimer = 0;
  private currentAttack: BossAttack = 'slam';

  public onDeath?: (x: number, y: number, souls: number) => void;
  public onAttack?: (x: number, y: number, dir: Phaser.Math.Vector2, damage: number, range: number, type: string) => void;
  public onPhaseChange?: (phase: number) => void;

  getHP() { return this.hp; }
  getMaxHP() { return BOSS_HP; }
  isAlive() { return this.alive; }
  getPhase() { return this.phase; }
  getName() { return 'THE ASHEN LORD'; }
  getIsParryable() { return this.isAttacking && this.currentAttack !== 'leap' && this.currentAttack !== 'aoe'; }
  getIsStaggered() { return this.bossState === 'staggered'; }
  getPoise() { return this.poise; }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    (scene.add as any).existing(this);
    this.sprite = scene.physics.add.sprite(0, 0, 'boss_idle');
    this.sprite.setOrigin(0.5, 0.75);
    this.sprite.setDepth(9);
    this.add(this.sprite);
    this.bossState = 'idle';
    this.sprite.setVelocity(0, 0);
  }

  getBody() { return this.sprite; }
  activate() { this.bossState = 'chase'; }

  update(delta: number, px: number, py: number, playerIsParrying: boolean = false): void {
    if (!this.alive) return;
    this.atkCd = Math.max(0, this.atkCd - delta);
    this.hurtTimer = Math.max(0, this.hurtTimer - delta);
    this.staggerTimer = Math.max(0, this.staggerTimer - delta);

    // Phase check
    if (this.phase === 1 && this.hp <= this.maxHp * 0.5) {
      this.phase = 2; this.bossState = 'enraged';
      this.sprite.setTint(0xff6644);
      this.sprite.setTexture('boss_enraged');
      if (this.onPhaseChange) this.onPhaseChange(2);
      this.scene.cameras.main.shake(500, 0.018);
      this.scene.time.delayedCall(1200, () => { if (this.alive) this.bossState = 'chase'; });
      return;
    }

    // Stagger
    if (this.bossState === 'staggered') {
      this.sprite.setVelocity(0, 0);
      this.sprite.setTint(0xffcc44);
      if (this.staggerTimer <= 0) {
        this.sprite.clearTint();
        this.sprite.setTexture(this.phase === 2 ? 'boss_enraged' : 'boss_idle');
        this.bossState = 'chase';
        this.poise = BOSS_POISE * 0.5;
      }
      return;
    }

    if (this.hurtTimer > 0 || this.isAttacking) return;

    const dx = px - this.x, dy = py - this.y, dist = Math.sqrt(dx * dx + dy * dy);
    const speed = BOSS_SPEED * (this.phase === 2 ? 1.4 : 1);

    switch (this.bossState) {
      case 'idle':
        this.sprite.setVelocity(0, 0);
        this.scene.time.delayedCall(2000, () => { if (this.alive) this.bossState = 'chase'; });
        this.bossState = '_wait'; break;
      case 'enraged': this.sprite.setVelocity(0, 0); break;
      case 'chase':
        if (dist < BOSS_ATTACK_RANGE && this.atkCd <= 0) { this.chooseAndPerformAttack(dx, dy, dist); return; }
        if (dist > 0) {
          this.sprite.setVelocity((dx / dist) * speed, (dy / dist) * speed);
          if (dx > 0) this.facingRight = true; else if (dx < 0) this.facingRight = false;
        }
        this.sprite.setFlipX(!this.facingRight);
        break;
    }
  }

  private chooseAndPerformAttack(dx: number, dy: number, dist: number): void {
    const attacks: BossAttack[] = this.phase === 1 ? ['slam', 'swing'] : ['slam', 'swing', 'leap', 'aoe'];
    this.currentAttack = Phaser.Utils.Array.GetRandom(attacks);
    this.performAttack(dx, dy);
  }

  private performAttack(dx: number, dy: number): void {
    this.isAttacking = true; this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('boss_attack');

    const dir = new Phaser.Math.Vector2(dx, dy).normalize();
    const dmg = this.phase === 2 ? BOSS_DAMAGE_P2 : BOSS_DAMAGE;
    const cd = BOSS_ATK_CD * (this.phase === 2 ? 0.65 : 1);

    switch (this.currentAttack) {
      case 'slam': this.doSlam(dir, dmg, cd); break;
      case 'swing': this.doSwing(dir, dmg, cd); break;
      case 'leap': this.doLeap(dir, dmg, cd, dx, dy); break;
      case 'aoe': this.doAOE(dmg, cd); break;
    }
  }

  private doSlam(dir: Phaser.Math.Vector2, dmg: number, cd: number): void {
    this.scene.time.delayedCall(400, () => {
      if (!this.alive) return;
      if (this.onAttack) this.onAttack(this.x + dir.x * BOSS_ATTACK_RANGE, this.y + dir.y * BOSS_ATTACK_RANGE * 0.5, dir, dmg, BOSS_ATTACK_RANGE, 'slam');
      this.scene.cameras.main.shake(250, 0.012);
    });
    this.scene.time.delayedCall(900, () => this.endAttack(cd));
  }

  private doSwing(dir: Phaser.Math.Vector2, dmg: number, cd: number): void {
    const range = BOSS_ATTACK_RANGE * 1.6;
    this.scene.time.delayedCall(350, () => {
      if (!this.alive) return;
      if (this.onAttack) this.onAttack(this.x + dir.x * range, this.y + dir.y * range * 0.5, dir, dmg * 1.1, range, 'swing');
      this.scene.cameras.main.shake(180, 0.008);
    });
    this.scene.time.delayedCall(800, () => this.endAttack(cd));
  }

  private doLeap(dir: Phaser.Math.Vector2, dmg: number, cd: number, dx: number, dy: number): void {
    // Leap toward player position
    const tx = this.x + dx * 0.7, ty = this.y + dy * 0.7;
    this.scene.tweens.add({
      targets: this, x: tx, y: ty, duration: 350, ease: 'Quad.easeIn',
      onComplete: () => {
        if (!this.alive) return;
        this.scene.cameras.main.shake(300, 0.018);
        const range = BOSS_ATTACK_RANGE * 2;
        if (this.onAttack) this.onAttack(this.x, this.y, dir, dmg * 1.5, range, 'leap');
        // Landing particles could go here
        this.scene.time.delayedCall(400, () => this.endAttack(cd));
      }
    });
  }

  private doAOE(dmg: number, cd: number): void {
    this.scene.time.delayedCall(600, () => {
      if (!this.alive) return;
      const range = BOSS_ATTACK_RANGE * 2.5;
      if (this.onAttack) this.onAttack(this.x, this.y, new Phaser.Math.Vector2(0, 0), dmg, range, 'aoe');
      this.scene.cameras.main.shake(400, 0.02);
      this.scene.cameras.main.flash(200, 100, 30, 30, true);
    });
    this.scene.time.delayedCall(1000, () => this.endAttack(cd));
  }

  private endAttack(cd: number): void {
    if (!this.alive) return;
    this.sprite.setTexture(this.phase === 2 ? 'boss_enraged' : 'boss_idle');
    this.bossState = 'chase'; this.isAttacking = false; this.atkCd = cd;
  }

  takeDamage(amount: number, knockbackDir?: Phaser.Math.Vector2): void {
    if (!this.alive) return;
    this.hp -= amount; this.hurtTimer = 120;
    if (knockbackDir) this.sprite.setVelocity(knockbackDir.x * 60, knockbackDir.y * 60);
    if (this.hp <= 0) this.die();
  }

  applyPoiseDamage(amount: number): void {
    this.poise -= amount;
    if (this.poise <= 0) this.staggerBoss();
  }

  staggerBoss(): void {
    if (!this.alive) return;
    this.poise = 0; this.bossState = 'staggered'; this.staggerTimer = 2500;
    this.isAttacking = false; this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('boss_stagger');
    this.scene.cameras.main.shake(300, 0.015);
  }

  takeRiposteDamage(damage: number): void {
    if (!this.alive) return;
    this.hp -= damage; this.scene.cameras.main.shake(400, 0.025);
    this.scene.cameras.main.flash(150, 255, 255, 200, true);
    this.bossState = 'staggered'; this.staggerTimer = 3000;
    if (this.hp <= 0) this.die();
  }

  die(): void {
    this.alive = false; this.bossState = 'dead';
    this.sprite.setVelocity(0, 0); this.scene.cameras.main.shake(800, 0.025);
    if (this.onDeath) this.scene.time.delayedCall(1200, () => this.onDeath(this.x, this.y, BOSS_SOULS));
    this.scene.tweens.add({ targets: this, alpha: 0, duration: 2500, delay: 1000, onComplete: () => this.destroy() });
  }
}