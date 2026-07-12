import { useEffect, useState, useCallback } from 'react';
import { getMascotByID } from '@wizkidz/mascot-system';
import { tapOnce } from '@wizkidz/game-utils';
import type { Game } from '../types';
import { CONFIG } from '../config';

// Physical booth controller: 3 buttons only (red / blue / yellow).
// Keyboard fallback mirrors every other game in the monorepo:
// Space/Enter/'b', ArrowLeft/'a', ArrowRight/'c'.
const KEY_SELECT = new Set([CONFIG.keyRed, ' ', 'Enter', 'b']);
const KEY_PREV = new Set([CONFIG.keyBlue, 'ArrowLeft', 'a']);
const KEY_NEXT = new Set([CONFIG.keyYellow, 'ArrowRight', 'c']);

// See games/*/src/components/ScreenAttract.tsx for why sizes are expressed
// in vmin via this helper (1vmin = 1% of the shorter screen edge, so the
// menu fills the actual kiosk display instead of scaling a fixed-aspect
// canvas and letterboxing). Divide by 10.8 to preserve each value's
// original look at the 1280x1080 design reference (1080 / 100 = 10.8).
const vmin = (px: number) => `${(px / 10.8).toFixed(2)}vmin`;

// Element sizes: floor at the original fixed-px value (so nothing gets
// smaller than the pre-dynamic design on a browser window shorter than the
// 1080px reference — a common case since the kiosk isn't always viewed
// fullscreen), scale via vmin above that, and cap at 1.6x so things don't
// balloon on very large displays.
const size = (px: number) => `clamp(${px}px, ${vmin(px)}, ${Math.round(px * 1.6)}px)`;

export default function MainMenu() {
  const [games, setGames] = useState<Game[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    fetch('/gameRegistry.json')
      .then(r => r.json())
      .then(data => setGames(data.games ?? []));
  }, []);

  const launch = useCallback((game: Game) => {
    window.location.href = `/games/${game.id}/`;
  }, []);

  const goPrev = useCallback(() => {
    setSelected(i => (i - 1 + games.length) % games.length);
  }, [games.length]);

  const goNext = useCallback(() => {
    setSelected(i => (i + 1) % games.length);
  }, [games.length]);

  const play = useCallback(() => {
    setSelected(i => {
      launch(games[i]);
      return i;
    });
  }, [games, launch]);

  useEffect(() => {
    if (games.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (KEY_PREV.has(e.key)) {
        e.preventDefault();
        setSelected(i => (i - 1 + games.length) % games.length);
      } else if (KEY_NEXT.has(e.key)) {
        e.preventDefault();
        setSelected(i => (i + 1) % games.length);
      } else if (KEY_SELECT.has(e.key)) {
        e.preventDefault();
        setSelected(i => {
          launch(games[i]);
          return i;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [games, launch]);

  // Auto-advance the carousel; any manual prev/next press above changes
  // `selected`, which resets this timer so it doesn't fight the player.
  useEffect(() => {
    if (games.length <= 1) return;
    const t = setTimeout(() => {
      setSelected(i => (i + 1) % games.length);
    }, CONFIG.carouselSeconds * 1000);
    return () => clearTimeout(t);
  }, [selected, games]);

  if (games.length === 0) return null;

  const game = games[selected];
  const themeColor = game.themeColor ?? getMascotByID(game.mascotID).color;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: `${size(40)} ${size(90)}`,
      }}
    >
      {/* Corner brand mark — fixed to the viewport (not the centered content
          column) so it sits in the extreme top-left of the physical screen,
          and out of the flow so it never pushes the game showcase down. */}
      <img
        src="/marketing-assets/logo/wiz-kidz-logo-teal-289x128.png"
        alt="Wiz Kidz"
        style={{ position: 'fixed', top: size(16), left: size(16), height: size(64), zIndex: 10 }}
      />

      {/* Selected game showcase */}
      <div
        className="bg-white border border-gray-100 overflow-hidden"
        style={{ width: '100%', maxWidth: vmin(900), borderRadius: size(16), boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        aria-live="polite"
      >
        {game.mascotImage && (
          <div
            className="flex items-center justify-center"
            style={{ background: themeColor + '18', height: size(220) }}
          >
            <img
              src={game.mascotImage}
              alt=""
              style={{ height: size(160), width: size(160), objectFit: 'contain' }}
            />
          </div>
        )}
        <div className="text-center" style={{ padding: size(24) }}>
          <h2 className="font-bold font-display text-gray-800" style={{ fontSize: size(24), marginBottom: size(8) }}>{game.name}</h2>
          <p className="text-gray-500 leading-snug" style={{ fontSize: size(16) }}>{game.description}</p>
        </div>
      </div>

      {/* Dots showing position among games */}
      <div style={{ display: 'flex', gap: size(8), marginTop: size(24) }} role="tablist" aria-label="Games">
        {games.map((g, i) => (
          <span
            key={g.id}
            role="tab"
            aria-selected={i === selected}
            className="rounded-full transition-all"
            style={{
              width: i === selected ? size(24) : size(10),
              height: size(10),
              background: i === selected ? themeColor : '#D1D5DB',
            }}
          />
        ))}
      </div>

      {/* 3-button legend — mirrors the physical booth controller, but also
          doubles as a touch/click control so the same screen works on a
          touchscreen kiosk. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size(40), marginTop: size(40) }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size(8) }}>
          <div
            {...tapOnce(goPrev)}
            className="rounded-full bg-wk-blue flex items-center justify-center text-white font-bold cursor-pointer"
            style={{ width: size(56), height: size(56), boxShadow: `0 ${size(6)} 0 #0888c4`, fontSize: size(24), touchAction: 'none' }}
          >
            ◀
          </div>
          <span className="font-semibold text-gray-600" style={{ fontSize: size(14) }}>Previous</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size(8) }}>
          <div
            {...tapOnce(play)}
            className="rounded-full bg-wk-red flex items-center justify-center text-white font-bold cursor-pointer"
            style={{ width: size(80), height: size(80), boxShadow: `0 ${size(8)} 0 #e62e2e`, fontSize: size(30), touchAction: 'none' }}
          >
            ●
          </div>
          <span className="font-semibold text-gray-600" style={{ fontSize: size(14) }}>Play {game.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size(8) }}>
          <div
            {...tapOnce(goNext)}
            className="rounded-full bg-wk-yellow flex items-center justify-center text-white font-bold cursor-pointer"
            style={{ width: size(56), height: size(56), boxShadow: `0 ${size(6)} 0 #e8ad12`, fontSize: size(24), touchAction: 'none' }}
          >
            ▶
          </div>
          <span className="font-semibold text-gray-600" style={{ fontSize: size(14) }}>Next</span>
        </div>
      </div>
    </div>
  );
}
