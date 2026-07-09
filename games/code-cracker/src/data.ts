export const BLUE   = '#0aa4eb', BLUE_D   = '#0888c4';
export const RED    = '#ff4747', RED_D    = '#e62e2e';
export const YELLOW = '#ffc832', YELLOW_D = '#e8ad12';

export const GAME_ID     = 'code-cracker';
export const GAME_TITLE  = 'Code Cracker';
export const GAME_TAG    = "Hi, I'm Yellow Fawn! Do you wanna code with me?";
export const THEME_COLOR = '#ffc832';
export const MASCOT_SRC  = '/marketing-assets/mascots/fawn.png';

export interface Level {
  walls: [number, number][];
  star: [number, number];
  batteries: [number, number][];
  start: [number, number];
}

export const LEVELS: Level[] = [
  { walls: [[1,1],[1,2],[3,2],[3,3]],              star: [4,0], batteries: [[2,4],[4,2]], start: [0,4] },
  { walls: [[0,3],[1,3],[2,3],[2,1],[3,1],[1,1]],  star: [4,0], batteries: [[1,4],[4,2]], start: [0,4] },
  { walls: [[1,2],[2,1],[3,2],[1,3],[3,0]],         star: [2,2], batteries: [[0,1],[4,3]], start: [0,4] },
];
