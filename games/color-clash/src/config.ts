// Booth setup — edit before the event.
export const CONFIG = {
  soundOn: true,
  idleSeconds: 60,   // auto-return to attract after this many idle seconds
  roundSeconds: 20,  // quiz / math round length (code-cracker always gets 90s)

  // Arcade button → keyboard key mappings.
  // Big red is always Space/Enter too; blue is ArrowLeft; yellow is ArrowRight.
  keyA: '1', // big red button
  keyB: '2', // blue button
  keyC: '3', // yellow button
} as const;
