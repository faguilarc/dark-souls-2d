// ─── Game Constants ───────────────────────────────────────────────
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

// Player
export const PLAYER_SPEED = 160;
export const PLAYER_DODGE_SPEED = 380;
export const PLAYER_DODGE_DURATION = 320; // ms
export const PLAYER_DODGE_COOLDOWN = 500;
export const PLAYER_I_FRAME_DUR = 400; // invincibility after hit
export const PLAYER_MAX_HP = 100;
export const PLAYER_MAX_STAMINA = 100;
export const PLAYER_STAMINA_REGEN = 28; // per second
export const PLAYER_ATTACK_STAMINA_COST = 22;
export const PLAYER_DODGE_STAMINA_COST = 25;
export const PLAYER_HEAL_STAMINA_COST = 0;
export const PLAYER_ATTACK_DAMAGE = 20;
export const PLAYER_ATTACK_RANGE = 38;
export const PLAYER_ATTACK_DURATION = 350;
export const PLAYER_HEAL_AMOUNT = 40;
export const PLAYER_MAX_ESTUS = 5;
export const PLAYER_HEAL_TIME = 800;

// Enemies
export const ENEMY_SPEED = 70;
export const ENEMY_CHASE_RANGE = 200;
export const ENEMY_ATTACK_RANGE = 36;
export const ENEMY_ATTACK_DAMAGE = 15;
export const ENEMY_ATTACK_COOLDOWN = 1200;
export const ENEMY_HP = 40;
export const ENEMY_SOULS = 50;

// Boss
export const BOSS_SPEED = 90;
export const BOSS_CHASE_RANGE = 350;
export const BOSS_ATTACK_RANGE = 50;
export const BOSS_ATTACK_DAMAGE = 30;
export const BOSS_ATTACK_COOLDOWN = 1800;
export const BOSS_HP = 300;
export const BOSS_SOULS = 500;

// World
export const TILE_SIZE = 32;
export const GRAVITY = 0;

// Colors (dark souls palette)
export const COLORS = {
  black: 0x0a0a0c,
  darkGray: 0x1a1a22,
  midGray: 0x3a3a4a,
  lightGray: 0x6a6a7a,
  playerBody: 0x8a7a6a,
  playerArmor: 0x5a5a6e,
  playerCape: 0x3a2a2a,
  playerSword: 0xb0a090,
  enemyBody: 0x4a4a3a,
  enemyEyes: 0xcc3333,
  bossBody: 0x2a1a2a,
  bossArmor: 0x4a2a4a,
  bossEyes: 0xff4444,
  bossSword: 0x8a2a2a,
  hpBar: 0xcc2222,
  staminaBar: 0x22aa44,
  estusGreen: 0x44cc66,
  soulsGold: 0xddaa33,
  bonfireOrange: 0xff8833,
  bonfireRed: 0xff4422,
  fog: 0x1a1a2a,
  ground: 0x2a2a35,
  wall: 0x1a1a24,
  wallTop: 0x3a3a4a,
  particle: 0xffaa44,
  blood: 0x880000,
  deathBlack: 0x000000,
  textLight: 0xcccccc,
  textDim: 0x666677,
  uiBg: 0x0a0a12,
  bossHp: 0xaa2222,
  bossHpBg: 0x1a0a0a,
};

// Input
export const KEYS = {
  UP: 'W',
  DOWN: 'S',
  LEFT: 'A',
  RIGHT: 'D',
  ATTACK: 'SPACE',
  DODGE: 'SHIFT',
  HEAL: 'E',
  INTERACT: 'F',
  PAUSE: 'ESC',
};