// Generic attract / splash screen — tap/press any button to start, or wait
// out the countdown and it starts on its own.

import { useEffect, useRef, useState } from 'react';

// Sizes are expressed in vmin (1vmin = 1% of the shorter screen edge) so every
// screen fills the actual display instead of scaling a fixed-aspect canvas
// and letterboxing. Divide by 10.8 to preserve each value's original look at
// the 1280x1080 design reference (1080 / 100 = 10.8).
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

interface Props {
  onPress: () => void;
  gameTitle: string;
  gameTag: string;
  mascotSrc: string;
  themeColor: string;
  countdownSeconds: number;
}

const FLOAT = 'wkBob 2.6s cubic-bezier(0.22,1,0.36,1) infinite';

export default function ScreenAttract({ onPress, gameTitle, gameTag, mascotSrc, themeColor, countdownSeconds }: Props) {
  const [countdown, setCountdown] = useState(countdownSeconds);
  // Ref so the auto-start effect always calls the latest onPress without
  // restarting the countdown when the parent re-renders.
  const onPressRef = useRef(onPress);
  useEffect(() => { onPressRef.current = onPress; }, [onPress]);

  useEffect(() => {
    if (countdown <= 0) { onPressRef.current(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div
      onClick={onPress}
      style={{
        position: 'absolute', inset: 0, cursor: 'pointer',
        background: `radial-gradient(${vmin(1100)} ${vmin(700)} at 20% -10%, rgba(10,164,235,0.25), transparent 70%),
                     radial-gradient(${vmin(900)} ${vmin(700)} at 85% 115%, rgba(163,0,120,0.3), transparent 70%),
                     var(--peacock-500)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: vmin(40), padding: `${vmin(60)} ${vmin(90)} ${vmin(160)}`, overflow: 'hidden',
      }}
    >
      <img
        src="/marketing-assets/logo/wiz-kidz-logo-white-1355x600.png"
        alt="Wiz Kidz AI &amp; Robotics"
        style={{ width: vmin(340), display: 'block' }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: vmin(70), flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: vmin(20), maxWidth: vmin(640) }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(80), lineHeight: 1.05, color: 'var(--seasalt)' }}>
            {gameTitle}
          </div>
          <div style={{ fontSize: vmin(32), fontWeight: 500, color: 'rgba(250,250,250,0.85)' }}>{gameTag}</div>
        </div>
        <img
          src={mascotSrc}
          alt="mascot"
          style={{ width: vmin(220), animation: FLOAT }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: vmin(44),
        color: 'var(--fawn-500)', animation: 'wkBlink 1.6s ease infinite', textAlign: 'center',
      }}>
        Press the big button to play!
      </div>
      <div style={{ fontSize: vmin(28), fontWeight: 600, color: 'rgba(250,250,250,0.75)', textAlign: 'center' }}>
        Starting automatically in {countdown}…
      </div>
      <div style={{
        position: 'absolute', bottom: vmin(140), left: 0, right: 0,
        height: vmin(6), background: themeColor, opacity: 0.6,
      }} />
    </div>
  );
}
