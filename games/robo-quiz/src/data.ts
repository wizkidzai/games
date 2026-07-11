export const BLUE   = '#0aa4eb', BLUE_D   = '#0888c4';
export const RED    = '#ff4747', RED_D    = '#e62e2e';
export const YELLOW = '#ffc832', YELLOW_D = '#e8ad12';

export const GAME_ID     = 'robo-quiz';
export const GAME_TITLE  = 'Robo Quiz';
export const GAME_TAG    = "Hi, I'm Peacock Pride. I challenge you to a STEM trivia!";
export const THEME_COLOR = '#006464';
export const MASCOT_SRC  = '/marketing-assets/mascots/peacock.png';

export interface Question { q: string; o: [string, string, string]; a: 0 | 1 | 2; }

export const QUESTIONS: Question[] = [
  { q: 'How many legs does a spider have?',        o: ['6', '8', '10'],              a: 1 },
  { q: 'Which planet do we live on?',              o: ['Mars', 'Jupiter', 'Earth'],  a: 2 },
  { q: 'What do plants need to grow?',             o: ['Water & sun', 'Candy', 'Loud music'], a: 0 },
  { q: 'What pulls you back down when you jump?',  o: ['The wind', 'Gravity', 'Magnets'], a: 1 },
  { q: 'How many sides does a triangle have?',     o: ['3', '4', '5'],               a: 0 },
  { q: 'What do bees make?',                       o: ['Milk', 'Juice', 'Honey'],    a: 2 },
  { q: 'Which one melts ice the fastest?',         o: ['Heat', 'Cold', 'Darkness'],  a: 0 },
  { q: 'What is the closest star to Earth?',       o: ['The Moon', 'The Sun', 'Mars'], a: 1 },
  { q: 'How many colors are in a rainbow?',        o: ['5', '7', '9'],               a: 1 },
  { q: 'What do tadpoles grow up to be?',          o: ['Frogs', 'Fish', 'Ducks'],    a: 0 },
  { q: 'Which travels the fastest?',               o: ['Sound', 'A rocket', 'Light'], a: 2 },
  { q: 'What does a robot follow?',                o: ['Dreams', 'Code', 'Smells'],  a: 1 },
  { q: 'Which one floats on water?',               o: ['A rock', 'A coin', 'Wood'],  a: 2 },
  { q: 'What season comes after winter?',          o: ['Spring', 'Fall', 'Summer'],  a: 0 },
  { q: 'Where does rain come from?',               o: ['Clouds', 'Trees', 'Volcanoes'], a: 0 },
  { q: 'How many wheels do most cars have?',       o: ['2', '3', '4'],               a: 2 },
  { q: 'What gives a robot its energy?',           o: ['A battery', 'A sandwich', 'A nap'], a: 0 },
  { q: 'Which animal can fly?',                    o: ['Penguin', 'Bat', 'Dolphin'], a: 1 },
];
