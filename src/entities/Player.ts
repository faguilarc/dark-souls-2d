import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_DODGE_SPEED, PLAYER_DODGE_DURATION,
  PLAYER_DODGE_COOLDOWN, PLAYER_I_FRAME_DUR, PLAYER_MAX_HP,
  PLAYER_MAX_STAMINA, PLAYER_STAMINA_REGEN, PLAYER_ATTACK_STAMINA_COST,
  PLAYER_DODGE_STAMINA_COST, PLAYER_ATTACK_DAMAGE, PLAYER_ATTACK_RANGE,
  PLAYER_ATTACK_DURATION, PLAYER_HEAL_AMOUNT, PLAYER_MAX_ESTUS,
  PLAYER_HEAL_TIME, COLORS,
} from '../utils/constants';

export type PlayerState = 'idle' | 'walk' | 'attack' | 'dodge' | 'heal' | 'dead' | 'resting';

export class Player extends Phaser.GameObjects.Container {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private hp: number = PLAYER_MAX_HP;
  private stamina: number = PLAYER_MAX_STAMINA;
  private estus: number = PLAYER_MAX_ESTUS;
  private souls: number = 0;
  private playerState: PlayerState = 'idle';
  private facingRight: boolean = true;
  private lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private dodgeTimer: number = 0;
  private dodgeCooldownTimer: number = 0;
  private attackTimer: number = 0;
  private healTimer: number = 0;
  private iFrameTimer: number = 0;

  public onAttack?: (x: number, y: number, dir: Phaser.Math.Vector2, damage: number) => void;
  public onHeal?: (amount: number) => void;
  public onDeath?: () => void;
  public onSoulsChanged?: (souls: number) => void;
  public onInteract?: () => void;
  public onRest?: () => void;

  public getHP(): number { return this.hp; }
  public getMaxHP(): number { return PLAYER_MAX_HP; }
  public getStamina(): number { return this.stamina; }
  public getMaxStamina(): number { return PLAYER_MAX_STAMINA; }
  public getEstus(): number { return this.estus; }
  public getMaxEstus(): number { return PLAYER_MAX_ESTUS; }
  public getSouls(): number { return this.souls; }
  public getState(): PlayerState { return this.playerState; }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    (scene.add as any).existing(this);

    this.sprite = scene.physics.add.sprite(0, 0, 'player_idle');
    this.sprite.setOrigin(0.5, 0.7);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.add(this.sprite);

    scene.input.keyboard!.on('keydown-SPACE', () => this.handleAttack());
    scene.input.keyboard!.on('keydown-SHIFT', () => this.handleDodge());
    scene.input.keyboard!.on('keydown-E', () => this.handleHeal());
    scene.input.keyboard!.on('keydown-F', () => {
      if (this.onInteract) this.onInteract();
      if (this.playerState === 'resting' && this.onRest) this.onRest();
    });
  }

  getBody(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  update(delta: number): void {
    if (this.playerState === 'dead') return;
    const dt = delta / 1000;

    this.dodgeCooldownTimer = Math.max(0, this.dodgeCooldownTimer - delta);
    this.iFrameTimer = Math.max(0, this.iFrameTimer - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);

    if (this.playerState !== 'dodge' && this.playerState !== 'attack' && this.playerState !== 'heal' && this.playerState !== 'resting') {
      this.stamina = Math.min(PLAYER_MAX_STAMINA, this.stamina + PLAYER_STAMINA_REGEN * dt);
    }

    // I-frame blink
    if (this.iFrameTimer > 0) {
      this.sprite.setAlpha(Math.floor(this.iFrameTimer / 50) % 2 === 0 ? 0.4 : 1);
    } else {
      this.sprite.setAlpha(1);
    }

    if (this.playerState === 'dodge') {
      this.dodgeTimer -= delta;
      if (this.dodgeTimer <= 0) {
        this.endDodge();
      } else {
        const vel = this.lastDirection.clone().normalize().scale(PLAYER_DODGE_SPEED);
        this.sprite.setVelocity(vel.x, vel.y);
        return;
      }
    }

    if (this.playerState === 'attack') {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) this.endAttack();
      return;
    }

    if (this.playerState === 'heal') {
      this.healTimer -= delta;
      if (this.healTimer <= 0) this.completeHeal();
      return;
    }

    if (this.playerState === 'resting') {
      this.sprite.setVelocity(0, 0);
      return;
    }

    // Movement
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    const wKey = this.scene.input.keyboard!.addKey('W');
    const aKey = this.scene.input.keyboard!.addKey('A');
    const sKey = this.scene.input.keyboard!.addKey('S');
    const dKey = this.scene.input.keyboard!.addKey('D');

    let vx = 0, vy = 0;
    if (aKey.isDown) { vx = -1; this.facingRight = false; }
    if (dKey.isDown) { vx = 1; this.facingRight = true; }
    if (wKey.isDown) vy = -1;
    if (sKey.isDown) vy = 1;

    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx = (vx / len) * PLAYER_SPEED;
      vy = (vy / len) * PLAYER_SPEED;
      this.lastDirection.set(vx, vy).normalize();
      this.playerState = 'walk';
      this.sprite.setTexture('player_idle');
    } else {
      this.playerState = 'idle';
    }

    this.sprite.setVelocity(vx, vy);
    this.sprite.setFlipX(!this.facingRight);
  }

  private handleAttack(): void {
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.attackTimer > 0 || this.stamina < PLAYER_ATTACK_STAMINA_COST) return;

    this.playerState = 'attack';
    this.stamina -= PLAYER_ATTACK_STAMINA_COST;
    this.attackTimer = PLAYER_ATTACK_DURATION;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('player_attack');

    const dir = this.facingRight ? new Phaser.Math.Vector2(1, 0) : new Phaser.Math.Vector2(-1, 0);
    const hitX = this.x + dir.x * PLAYER_ATTACK_RANGE;
    const hitY = this.y;
    if (this.onAttack) this.onAttack(hitX, hitY, dir, PLAYER_ATTACK_DAMAGE);
  }

  private endAttack(): void {
    if (this.playerState !== 'dead') {
      this.playerState = 'idle';
      this.sprite.setTexture('player_idle');
    }
  }

  private handleDodge(): void {
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.dodgeTimer > 0 || this.dodgeCooldownTimer > 0) return;
    if (this.stamina < PLAYER_DODGE_STAMINA_COST) return;

    this.playerState = 'dodge';
    this.stamina -= PLAYER_DODGE_STAMINA_COST;
    this.dodgeTimer = PLAYER_DODGE_DURATION;
    this.dodgeCooldownTimer = PLAYER_DODGE_COOLDOWN;
    this.iFrameTimer = PLAYER_DODGE_DURATION;
    this.sprite.setTexture('player_dodge');
  }

  private endDodge(): void {
    if (this.playerState !== 'dead') {
      this.playerState = 'idle';
      this.sprite.setTexture('player_idle');
      this.sprite.setVelocity(0, 0);
    }
  }

  private handleHeal(): void {
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.healTimer > 0 || this.estus <= 0 || this.hp >= PLAYER_MAX_HP) return;

    this.playerState = 'heal';
    this.estus--;
    this.healTimer = PLAYER_HEAL_TIME;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('player_heal');
  }

  private completeHeal(): void {
    const healed = Math.min(PLAYER_HEAL_AMOUNT, PLAYER_MAX_HP - this.hp);
    this.hp += healed;
    if (this.onHeal) this.onHeal(healed);
    this.playerState = 'idle';
    this.sprite.setTexture('player_idle');
  }

  takeDamage(amount: number): void {
    if (this.playerState === 'dead' || this.iFrameTimer > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.iFrameTimer = PLAYER_I_FRAME_DUR;
    this.scene.cameras.main.flash(100, 255, 0, 0);
    this.scene.cameras.main.shake(120, 0.008);
    if (this.hp <= 0) this.die();
  }

  die(): void {
    this.playerState = 'dead';
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('player_dodge');
    this.sprite.setTint(COLORS.midGray);
    if (this.onDeath) this.scene.time.delayedCall(500, () => this.onDeath());
  }

  respawn(x: number, y: number): void {
    this.setPosition(x, y);
    this.hp = PLAYER_MAX_HP;
    this.stamina = PLAYER_MAX_STAMINA;
    this.playerState = 'idle';
    this.sprite.setTexture('player_idle');
    this.sprite.setTint(0xffffff);
    this.sprite.setAlpha(1);
    this.iFrameTimer = 1500;
    this.souls = Math.floor(this.souls * 0.5);
    if (this.onSoulsChanged) this.onSoulsChanged(this.souls);
  }

  addSouls(amount: number): void {
    this.souls += amount;
    if (this.onSoulsChanged) this.onSoulsChanged(this.souls);
  }

  setResting(resting: boolean): void {
    if (resting) {
      this.playerState = 'resting';
      this.sprite.setVelocity(0, 0);
      this.hp = PLAYER_MAX_HP;
      this.stamina = PLAYER_MAX_STAMINA;
      this.estus = PLAYER_MAX_ESTUS;
    } else {
      this.playerState = 'idle';
      this.iFrameTimer = 1000;
    }
  }

  isResting(): boolean { return this.playerState === 'resting'; }
  getFacingDirection(): Phaser.Math.Vector2 { return this.lastDirection.clone(); }
}