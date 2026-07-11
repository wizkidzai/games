// Booth setup — edit before the event.
export const CONFIG = {
  soundOn: true,
  idleSeconds: 30,   // no input for this long on any screen → return to kiosk
  roundSeconds: 30,  // round length
  attractCountdownSeconds: 5, // landing page auto-starts the game after this many seconds

  // Arcade button → keyboard key mappings, named by physical button color.
  keyRed: '1',    // big red button (also Space/Enter/'b')
  keyBlue: '2',   // blue button (also ArrowLeft/'a')
  keyYellow: '3', // yellow button (also ArrowRight/'c')
} as const;
