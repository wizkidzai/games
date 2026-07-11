// Booth setup — edit before the event.
export const CONFIG = {
  soundOn: true,
  idleSeconds: 60,   // auto-return to attract after this many idle seconds
  roundSeconds: 45,  // quiz / math round length (code-cracker always gets 90s)
  goHoldSeconds: 3,  // on-screen GO! button: press-and-hold duration before auto-launch

  // Arcade button → keyboard key mappings, named by physical button color.
  keyRed: '1',    // big red button (also Space/Enter/'b')
  keyBlue: '2',   // blue button (also ArrowLeft/'a')
  keyYellow: '3', // yellow button (also ArrowRight/'c')
} as const;
