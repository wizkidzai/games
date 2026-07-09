// Echo Bots — Simon-style pad data
// Mascot images come from marketing-assets submodule.

export const BLUE   = '#0aa4eb', BLUE_D   = '#0888c4';
export const RED    = '#ff4747', RED_D    = '#e62e2e';
export const YELLOW = '#ffc832', YELLOW_D = '#e8ad12';

export const GAME_ID    = 'echo-bots';
export const GAME_TITLE = 'Echo Bots';
export const GAME_TAG   = "Hi, I'm Blue Jay! Do you want to test your memory power?";
export const THEME_COLOR = '#0aa4eb';
export const MASCOT_SRC  = '/marketing-assets/mascots/jay.png';

// 3 pads: blue (jay), red (fox), yellow (fawn)
export const PAD_COLORS = [
  { bg: BLUE,   dim: '#06526f', img: '/marketing-assets/mascots/jay.png' },
  { bg: RED,    dim: '#6e2020', img: '/marketing-assets/mascots/fox.png' },
  { bg: YELLOW, dim: '#6e5716', img: '/marketing-assets/mascots/fawn.png' },
] as const;
