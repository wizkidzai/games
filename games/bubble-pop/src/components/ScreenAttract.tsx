// Generic attract / splash screen — tap/press any button to start.
// Logo and mascot image are passed as props so each game can customise.

interface Props {
  onPress: () => void;
  gameTitle: string;
  gameTag: string;
  mascotSrc: string;
  themeColor: string;
}

const FLOAT = 'wkBob 2.6s cubic-bezier(0.22,1,0.36,1) infinite';

export default function ScreenAttract({ onPress, gameTitle, gameTag, mascotSrc, themeColor }: Props) {
  return (
    <div
      onClick={onPress}
      style={{
        position: 'absolute', inset: 0, cursor: 'pointer',
        background: `radial-gradient(1100px 700px at 20% -10%, rgba(10,164,235,0.25), transparent 70%),
                     radial-gradient(900px 700px at 85% 115%, rgba(163,0,120,0.3), transparent 70%),
                     var(--peacock-500)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 40, padding: '60px 90px 160px', overflow: 'hidden',
      }}
    >
      <img
        src="/marketing-assets/logos/wizkidz-logo-seasalt.png"
        alt="Wiz Kidz AI &amp; Robotics"
        style={{ width: 340, display: 'block' }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 70 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 80, lineHeight: 1.05, color: 'var(--seasalt)' }}>
            {gameTitle}
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, color: 'rgba(250,250,250,0.85)' }}>{gameTag}</div>
        </div>
        <img
          src={mascotSrc}
          alt="mascot"
          style={{ width: 220, animation: FLOAT }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 44,
        color: 'var(--fawn-500)', animation: 'wkBlink 1.6s ease infinite',
      }}>
        Press the big button to play!
      </div>
      <div style={{
        position: 'absolute', bottom: 140, left: 0, right: 0,
        height: 6, background: themeColor, opacity: 0.6,
      }} />
    </div>
  );
}
