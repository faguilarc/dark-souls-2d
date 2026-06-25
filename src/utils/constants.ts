// ─── Game Constants ───────────────────────────────────────────────
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

// Player
export const PLAYER_SPEED = 165;
export const PLAYER_LOCK_ON_SPEED = 120;
export const PLAYER_DODGE_SPEED = 400;
export const PLAYER_DODGE_DURATION = 300;
export const PLAYER_DODGE_COOLDOWN = 400;
export const PLAYER_I_FRAME_DUR = 350;
export const PLAYER_MAX_HP = 120;
export const PLAYER_MAX_STAMINA = 110;
export const PLAYER_STAMINA_REGEN = 30;
export const PLAYER_LIGHT_ATTACK_STAMINA = 18;
export const PLAYER_HEAVY_ATTACK_STAMINA = 35;
export const PLAYER_DODGE_STAMINA_COST = 22;
export const PLAYER_PARRY_STAMINA_COST = 15;
export const PLAYER_LIGHT_DAMAGE = 22;
export const PLAYER_HEAVY_DAMAGE = 45;
export const PLAYER_RIPOSTE_DAMAGE = 80;
export const PLAYER_ATTACK_RANGE = 40;
export const PLAYER_HEAVY_ATTACK_RANGE = 50;
export const PLAYER_LIGHT_DURATION = 300;
export const PLAYER_HEAVY_DURATION = 500;
export const PLAYER_PARRY_WINDOW = 350;
export const PLAYER_PARRY_DURATION = 400;
export const PLAYER_HEAL_AMOUNT = 45;
export const PLAYER_MAX_ESTUS = 5;
export const PLAYER_HEAL_TIME = 900;
export const PLAYER_LOCK_ON_RANGE = 280;

// Enemies — Hollow (fast, weak)
export const HOLLOW_SPEED = 75;
export const HOLLOW_CHASE_RANGE = 210;
export const HOLLOW_ATTACK_RANGE = 34;
export const HOLLOW_DAMAGE = 12;
export const HOLLOW_ATK_CD = 1100;
export const HOLLOW_HP = 35;
export const HOLLOW_SOULS = 40;
export const HOLLOW_POISE = 20; // stagger threshold

// Enemies — Black Knight (slow, strong, armored)
export const KNIGHT_SPEED = 50;
export const KNIGHT_CHASE_RANGE = 240;
export const KNIGHT_ATTACK_RANGE = 42;
export const KNIGHT_DAMAGE = 28;
export const KNIGHT_ATK_CD = 2000;
export const KNIGHT_HP = 90;
export const KNIGHT_SOULS = 120;
export const KNIGHT_POISE = 60;

// Boss
export const BOSS_SPEED = 85;
export const BOSS_CHASE_RANGE = 380;
export const BOSS_ATTACK_RANGE = 55;
export const BOSS_DAMAGE = 28;
export const BOSS_DAMAGE_P2 = 38;
export const BOSS_ATK_CD = 1600;
export const BOSS_HP = 400;
export const BOSS_SOULS = 800;
export const BOSS_POISE = 100;

// World
export const TILE_SIZE = 32;

// Colors
export const C = {
  black: 0x08080a,
  darkBg: 0x0c0c10,
  ground1: 0x22222c,
  ground2: 0x252530,
  groundCrack: 0x1a1a24,
  wall: 0x14141c,
  wallHi: 0x2c2c3a,
  wallLo: 0x0e0e14,
  wallMortar: 0x0a0a10,
  // Player
  pSkin: 0xc4a882,
  pSkinShadow: 0x9a8060,
  pArmor: 0x555568,
  pArmorHi: 0x6a6a80,
  pArmorLo: 0x3a3a4e,
  pHelm: 0x4a4a5e,
  pHelmVisor: 0x222233,
  pCape: 0x3a2222,
  pCapeHi: 0x5a3333,
  pSword: 0xc0b8a8,
  pSwordEdge: 0xe0ddd0,
  pSwordHilt: 0x664422,
  pBoot: 0x2a2a38,
  pParryShield: 0x888898,
  // Hollow
  hBody: 0x555544,
  hBodyShadow: 0x3a3a2a,
  hSkin: 0x6a6a50,
  hEyes: 0xcc2222,
  hWeapon: 0x7a7a5a,
  hRags: 0x444438,
  // Knight
  kArmor: 0x2a2a3a,
  kArmorHi: 0x3a3a50,
  kArmorLo: 0x1a1a28,
  kPlume: 0x880022,
  kEyes: 0xff4444,
  kSword: 0x9999aa,
  kShield: 0x555568,
  // Boss
  bBody: 0x1a0a1a,
  bArmor: 0x3a1a3a,
  bArmorHi: 0x5a2a5a,
  bArmorLo: 0x2a0a2a,
  bHorns: 0x5a3a3a,
  bEyes: 0xff2222,
  bEyesGlow: 0xff6644,
  bSword: 0x7a2a2a,
  bSwordEdge: 0xaa4444,
  bCape: 0x1a0a2a,
  // FX
  hpBar: 0xbb1a1a,
  hpBarLow: 0xdd3322,
  staminaBar: 0x1a9944,
  estusGreen: 0x33bb55,
  soulsGold: 0xddaa22,
  bonfireOrange: 0xff7722,
  bonfireYellow: 0xffcc44,
  bonfireRed: 0xff3311,
  fog: 0x14141e,
  torchGlow: 0xff9944,
  particle: 0xffaa44,
  blood: 0x881111,
  bloodBright: 0xcc2222,
  soulGlow: 0xffee66,
  parryFlash: 0xffffff,
  staggerStar: 0xffff44,
  uiBg: 0x08080e,
  bossHp: 0x991a1a,
  bossHpBg: 0x140808,
  lockOn: 0xff4444,
  textLight: 0xbbbbbb,
  textDim: 0x555566,
  textGold: 0xddaa33,
  heavySlash: 0xffccaa,
  torchWood: 0x553311,
  torchFlame: 0xff8822,
  bloodStain: 0x440808,
  bone: 0x998877,
  cobweb: 0x222230,
};