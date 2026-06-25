import Phaser from 'phaser';
import {
  PLAYER_SPEED, PLAYER_LOCK_ON_SPEED, PLAYER_DODGE_SPEED, PLAYER_DODGE_DURATION,
  PLAYER_DODGE_COOLDOWN, PLAYER_I_FRAME_DUR, PLAYER_MAX_HP,
  PLAYER_MAX_STAMINA, PLAYER_STAMINA_REGEN, PLAYER_LIGHT_ATTACK_STAMINA,
  PLAYER_HEAVY_ATTACK_STAMINA, PLAYER_DODGE_STAMINA_COST,
  PLAYER_PARRY_STAMINA_COST, PLAYER_LIGHT_DAMAGE, PLAYER_HEAVY_DAMAGE,
  PLAYER_RIPOSTE_DAMAGE, PLAYER_ATTACK_RANGE, PLAYER_HEAVY_ATTACK_RANGE,
  PLAYER_LIGHT_DURATION, PLAYER_HEAVY_DURATION, PLAYER_PARRY_WINDOW,
  PLAYER_PARRY_DURATION, PLAYER_HEAL_AMOUNT, PLAYER_MAX_ESTUS,
  PLAYER_HEAL_TIME, PLAYER_LOCK_ON_RANGE, C,
} from '../utils/constants';

export type PlayerState = 'idle' | 'walk' | 'attack_light' | 'attack_heavy' | 'parry' | 'dodge' | 'heal' | 'dead' | 'resting';

export class Player extends Phaser.GameObjects.Container {
  private sprite!: Phaser.Physics.Arcade.Sprite;
  private hp = PLAYER_MAX_HP;
  private stamina = PLAYER_MAX_STAMINA;
  private estus = PLAYER_MAX_ESTUS;
  private souls = 0;
  private playerState: PlayerState = 'idle';
  private facingRight = true;
  private lastDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private dodgeTimer = 0;
  private dodgeCooldown = 0;
  private attackTimer = 0;
  private healTimer = 0;
  private iFrameTimer = 0;
  private parryTimer = 0;
  private parrySuccessTimer = 0;
  private spaceHeldTime = 0;
  private lockOnTarget: any = null;
  private lockOnIndicator!: Phaser.GameObjects.Sprite;

  // Callbacks
  public onAttack?: (x: number, y: number, dir: Phaser.Math.Vector2, damage: number, isHeavy: boolean) => void;
  public onParry?: () => void;
  public onRiposte?: (target: any, dir: Phaser.Math.Vector2) => void;
  public onHeal?: (amount: number) => void;
  public onDeath?: () => void;
  public onSoulsChanged?: (souls: number) => void;
  public onInteract?: () => void;
  public onLockOnChanged?: (target: any) => void;

  // Getters
  public getHP() { return this.hp; }
  public getMaxHP() { return PLAYER_MAX_HP; }
  public getStamina() { return this.stamina; }
  public getMaxStamina() { return PLAYER_MAX_STAMINA; }
  public getEstus() { return this.estus; }
  public getMaxEstus() { return PLAYER_MAX_ESTUS; }
  public getSouls() { return this.souls; }
  public getState() { return this.playerState; }
  public getLockOnTarget() { return this.lockOnTarget; }
  public getIsParrying() { return this.parryTimer > 0; }
  public getParrySuccess() { return this.parrySuccessTimer > 0; }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    (scene.add as any).existing(this);
    this.sprite = scene.physics.add.sprite(0, 0, 'player_idle');
    this.sprite.setOrigin(0.5, 0.75);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.add(this.sprite);

    this.lockOnIndicator = scene.add.sprite(0, 0, 'lockon').setVisible(false).setDepth(20);
    this.lockOnIndicator.setOrigin(0.5);

    scene.input.keyboard!.on('keydown-SPACE', () => { this.spaceHeldTime = performance.now(); });
    scene.input.keyboard!.on('keyup-SPACE', () => this.handleAttackRelease());
    scene.input.keyboard!.on('keydown-SHIFT', () => this.handleDodge());
    scene.input.keyboard!.on('keydown-E', () => this.handleHeal());
    scene.input.keyboard!.on('keydown-R', () => this.handleParry());
    scene.input.keyboard!.on('keydown-Q', () => this.handleLockOn());
    scene.input.keyboard!.on('keydown-F', () => { if (this.onInteract) this.onInteract(); });
  }

  getBody() { return this.sprite; }

  update(delta: number, allEnemies: any[] = [], boss: any = null): void {
    if (this.playerState === 'dead') return;
    const dt = delta / 1000;

    // Timers
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - delta);
    this.iFrameTimer = Math.max(0, this.iFrameTimer - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    this.parryTimer = Math.max(0, this.parryTimer - delta);
    this.parrySuccessTimer = Math.max(0, this.parrySuccessTimer - delta);

    // Stamina regen
    if (this.playerState !== 'dodge' && this.playerState !== 'attack_light' && this.playerState !== 'attack_heavy' && this.playerState !== 'parry' && this.playerState !== 'heal' && this.playerState !== 'resting') {
      this.stamina = Math.min(PLAYER_MAX_STAMINA, this.stamina + PLAYER_STAMINA_REGEN * dt);
    }

    // I-frame blink
    if (this.iFrameTimer > 0) {
      this.sprite.setAlpha(Math.floor(this.iFrameTimer / 40) % 2 === 0 ? 0.3 : 1);
    } else if (this.parrySuccessTimer > 0) {
      this.sprite.setTint(0xffffcc);
    } else {
      this.sprite.setAlpha(1);
      this.sprite.clearTint();
    }

    // Dodge movement
    if (this.playerState === 'dodge') {
      this.dodgeTimer -= delta;
      if (this.dodgeTimer <= 0) { this.endDodge(); }
      else { const v = this.lastDir.clone().normalize().scale(PLAYER_DODGE_SPEED); this.sprite.setVelocity(v.x, v.y); return; }
    }

    // Attack timer
    if (this.playerState === 'attack_light' || this.playerState === 'attack_heavy') {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) this.endAttack();
      return;
    }

    // Parry timer
    if (this.playerState === 'parry') {
      this.parryTimer -= delta;
      if (this.parryTimer <= 0) this.endParry();
      return;
    }

    // Heal timer
    if (this.playerState === 'heal') {
      this.healTimer -= delta;
      if (this.healTimer <= 0) this.completeHeal();
      return;
    }

    if (this.playerState === 'resting') { this.sprite.setVelocity(0, 0); this.updateLockOnIndicator(); return; }

    // Movement
    const w = this.scene.input.keyboard!.addKey('W');
    const a = this.scene.input.keyboard!.addKey('A');
    const s = this.scene.input.keyboard!.addKey('S');
    const d = this.scene.input.keyboard!.addKey('D');
    let vx = 0, vy = 0;
    if (a.isDown) { vx = -1; this.facingRight = false; }
    if (d.isDown) { vx = 1; this.facingRight = true; }
    if (w.isDown) vy = -1;
    if (s.isDown) vy = 1;

    // Lock-on movement (strafe)
    if (this.lockOnTarget && this.lockOnTarget.isAlive && this.lockOnTarget.isAlive()) {
      const tx = this.lockOnTarget.x - this.x;
      const ty = this.lockOnTarget.y - this.y;
      if (tx !== 0 || ty !== 0) {
        const len = Math.sqrt(tx * tx + ty * ty);
        this.facingRight = tx > 0;
        this.lastDir.set(tx / len, ty / len);
      }
      if (len > PLAYER_LOCK_ON_RANGE * 1.5 || !this.lockOnTarget.isAlive()) {
        this.lockOnTarget = null;
        if (this.onLockOnChanged) this.onLockOnChanged(null);
      }
    }

    const len = Math.sqrt(vx * vx + vy * vy);
    const speed = this.lockOnTarget ? PLAYER_LOCK_ON_SPEED : PLAYER_SPEED;
    if (len > 0) {
      vx = (vx / len) * speed; vy = (vy / len) * speed;
      if (!this.lockOnTarget) this.lastDir.set(vx, vy).normalize();
      this.playerState = 'walk';
      this.sprite.setTexture('player_walk');
    } else {
      this.playerState = 'idle';
      this.sprite.setTexture('player_idle');
    }
    this.sprite.setVelocity(vx, vy);
    this.sprite.setFlipX(!this.facingRight);
    this.updateLockOnIndicator();
  }

  private handleAttackRelease(): void {
    const held = performance.now() - this.spaceHeldTime;
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.attackTimer > 0) return;

    const isHeavy = held > 300;

    if (isHeavy) {
      if (this.stamina < PLAYER_HEAVY_ATTACK_STAMINA) return;
      this.playerState = 'attack_heavy';
      this.stamina -= PLAYER_HEAVY_ATTACK_STAMINA;
      this.attackTimer = PLAYER_HEAVY_DURATION;
      this.sprite.setTexture('player_attack_heavy');
    } else {
      if (this.stamina < PLAYER_LIGHT_ATTACK_STAMINA) return;
      this.playerState = 'attack_light';
      this.stamina -= PLAYER_LIGHT_ATTACK_STAMINA;
      this.attackTimer = PLAYER_LIGHT_DURATION;
      this.sprite.setTexture('player_attack_light');
    }

    this.sprite.setVelocity(0, 0);
    const dir = this.lockOnTarget
      ? new Phaser.Math.Vector2(this.lockOnTarget.x - this.x, this.lockOnTarget.y - this.y).normalize()
      : (this.facingRight ? new Phaser.Math.Vector2(1, 0) : new Phaser.Math.Vector2(-1, 0));
    const range = isHeavy ? PLAYER_HEAVY_ATTACK_RANGE : PLAYER_ATTACK_RANGE;
    const damage = isHeavy ? PLAYER_HEAVY_DAMAGE : PLAYER_LIGHT_DAMAGE;
    if (this.onAttack) this.onAttack(this.x + dir.x * range, this.y + dir.y * range, dir, damage, isHeavy);
  }

  private endAttack(): void {
    if (this.playerState !== 'dead') { this.playerState = 'idle'; this.sprite.setTexture('player_idle'); }
  }

  private handleDodge(): void {
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.dodgeTimer > 0 || this.dodgeCooldown > 0) return;
    if (this.stamina < PLAYER_DODGE_STAMINA_COST) return;

    this.playerState = 'dodge';
    this.stamina -= PLAYER_DODGE_STAMINA_COST;
    this.dodgeTimer = PLAYER_DODGE_DURATION;
    this.dodgeCooldown = PLAYER_DODGE_COOLDOWN;
    this.iFrameTimer = PLAYER_DODGE_DURATION;
    this.sprite.setTexture('player_dodge');

    // Directional dodge
    const w = this.scene.input.keyboard!.addKey('W').isDown;
    const a = this.scene.input.keyboard!.addKey('A').isDown;
    const s = this.scene.input.keyboard!.addKey('S').isDown;
    const d = this.scene.input.keyboard!.addKey('D').isDown;
    let dx = 0, dy = 0;
    if (a) dx = -1; if (d) dx = 1; if (w) dy = -1; if (s) dy = 1;
    if (dx === 0 && dy === 0) {
      // Backstep if not moving
      dx = this.facingRight ? -1 : 1;
    }
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) this.lastDir.set(dx / len, dy / len);

    // Break lock-on on dodge
    if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
      this.lockOnTarget = null;
      if (this.onLockOnChanged) this.onLockOnChanged(null);
    }
  }

  private endDodge(): void {
    if (this.playerState !== 'dead') {
      this.playerState = 'idle'; this.sprite.setTexture('player_idle'); this.sprite.setVelocity(0, 0);
    }
  }

  private handleParry(): void {
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.parryTimer > 0 || this.stamina < PLAYER_PARRY_STAMINA_COST) return;

    this.playerState = 'parry';
    this.stamina -= PLAYER_PARRY_STAMINA_COST;
    this.parryTimer = PLAYER_PARRY_WINDOW;
    this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('player_parry');
    if (this.onParry) this.onParry();
  }

  endParry(): void {
    if (this.playerState !== 'dead') { this.playerState = 'idle'; this.sprite.setTexture('player_idle'); }
  }

  // Called by GameScene when parry is successful
  onParrySuccess(target: any): void {
    this.parrySuccessTimer = 600;
    this.sprite.setVelocity(0, 0);
    if (this.onRiposte && target) {
      const dir = new Phaser.Math.Vector2(target.x - this.x, target.y - this.y).normalize();
      this.onRiposte(target, dir);
    }
  }

  private handleHeal(): void {
    if (this.playerState === 'dead' || this.playerState === 'resting') return;
    if (this.healTimer > 0 || this.estus <= 0 || this.hp >= PLAYER_MAX_HP) return;
    this.playerState = 'heal'; this.estus--; this.healTimer = PLAYER_HEAL_TIME;
    this.sprite.setVelocity(0, 0); this.sprite.setTexture('player_heal');
  }

  private completeHeal(): void {
    const healed = Math.min(PLAYER_HEAL_AMOUNT, PLAYER_MAX_HP - this.hp);
    this.hp += healed;
    if (this.onHeal) this.onHeal(healed);
    this.playerState = 'idle'; this.sprite.setTexture('player_idle');
  }

  takeDamage(amount: number): void {
    if (this.playerState === 'dead' || this.iFrameTimer > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.iFrameTimer = PLAYER_I_FRAME_DUR;
    this.scene.cameras.main.flash(80, 200, 0, 0, true);
    this.scene.cameras.main.shake(100, 0.006);
    if (this.hp <= 0) this.die();
  }

  die(): void {
    this.playerState = 'dead'; this.sprite.setVelocity(0, 0);
    this.sprite.setTexture('player_dodge'); this.sprite.setTint(C.midGray);
    if (this.onDeath) this.scene.time.delayedCall(500, () => this.onDeath());
  }

  respawn(x: number, y: number): void {
    this.setPosition(x, y); this.hp = PLAYER_MAX_HP; this.stamina = PLAYER_MAX_STAMINA;
    this.playerState = 'idle'; this.sprite.setTexture('player_idle');
    this.sprite.setTint(0xffffff); this.sprite.setAlpha(1);
    this.iFrameTimer = 1500; this.souls = Math.floor(this.souls * 0.5);
    if (this.onSoulsChanged) this.onSoulsChanged(this.souls);
  }

  addSouls(amount: number): void { this.souls += amount; if (this.onSoulsChanged) this.onSoulsChanged(this.souls); }

  setResting(r: boolean): void {
    if (r) { this.playerState = 'resting'; this.sprite.setVelocity(0, 0); this.hp = PLAYER_MAX_HP; this.stamina = PLAYER_MAX_STAMINA; this.estus = PLAYER_MAX_ESTUS; }
    else { this.playerState = 'idle'; this.iFrameTimer = 1000; }
  }
  isResting() { return this.playerState === 'resting'; }

  private handleLockOn(): void {
    if (this.lockOnTarget) {
      this.lockOnTarget = null;
      if (this.onLockOnChanged) this.onLockOnChanged(null);
      return;
    }
    // Find nearest enemy
    const gameScene = this.scene as any;
    const allTargets = [...(gameScene.getEnemies?.() || []), gameScene.getBoss?.()].filter(e => e && e.isAlive && e.isAlive());
    let nearest: any = null, minDist = PLAYER_LOCK_ON_RANGE;
    allTargets.forEach(e => {
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    });
    if (nearest) {
      this.lockOnTarget = nearest;
      if (this.onLockOnChanged) this.onLockOnChanged(nearest);
    }
  }

  private updateLockOnIndicator(): void {
    if (this.lockOnTarget && this.lockOnTarget.isAlive && this.lockOnTarget.isAlive()) {
      this.lockOnIndicator.setPosition(this.lockOnTarget.x, this.lockOnTarget.y - 24).setVisible(true);
      // Pulse
      this.lockOnIndicator.setScale(0.9 + Math.sin(performance.now() / 150) * 0.1);
    } else {
      this.lockOnIndicator.setVisible(false);
      this.lockOnTarget = null;
    }
  }

  getFacingDirection(): Phaser.Math.Vector2 { return this.lastDir.clone(); }
}