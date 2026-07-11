// Booth setup — edit before the event.
export const CONFIG = {
  carouselSeconds: 5,      // auto-advance the game showcase after this many seconds
  idleTimeoutMinutes: 30,  // reload back to the main menu after this many idle minutes

  // Arcade button → keyboard key mappings, named by physical button color.
  keyRed: '1',    // big red button — select/launch (also Space/Enter/'b')
  keyBlue: '2',   // blue button — previous game (also ArrowLeft/'a')
  keyYellow: '3', // yellow button — next game (also ArrowRight/'c')
} as const;
