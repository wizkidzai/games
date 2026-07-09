import { useEffect, useState, useCallback } from 'react';
import { getMascotByID } from '@wizkidz/mascot-system';
import type { Game } from '../types';

// Physical booth controller: 3 buttons only (red / blue / yellow).
// Hardware emits keys '1' (red), '2' (blue), '3' (yellow); keyboard fallback
// mirrors every other game in the monorepo: Space/Enter, ArrowLeft, ArrowRight.
const KEY_SELECT = new Set(['1', ' ', 'Enter']);
const KEY_PREV = new Set(['2', 'ArrowLeft']);
const KEY_NEXT = new Set(['3', 'ArrowRight']);

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

  // Auto-advance the carousel every 3s; any manual prev/next press above
  // changes `selected`, which resets this timer so it doesn't fight the player.
  useEffect(() => {
    if (games.length <= 1) return;
    const t = setTimeout(() => {
      setSelected(i => (i + 1) % games.length);
    }, 3000);
    return () => clearTimeout(t);
  }, [selected, games]);

  if (games.length === 0) return null;

  const game = games[selected];
  const themeColor = game.themeColor ?? getMascotByID(game.mascotID).color;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col items-center">
      {/* Corner brand mark — fixed to the viewport (not the centered content
          column) so it sits in the extreme top-left of the physical screen,
          and out of the flow so it never pushes the game showcase down. */}
      <img
        src="/marketing-assets/logo/wiz-kidz-logo-teal-289x128.png"
        alt="Wiz Kidz"
        style={{ position: 'fixed', top: 16, left: 16, height: 64, zIndex: 10 }}
      />

      {/* Selected game showcase */}
      <div
        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        aria-live="polite"
      >
        {game.mascotImage && (
          <div
            className="flex items-center justify-center"
            style={{ background: themeColor + '18', height: 220 }}
          >
            <img
              src={game.mascotImage}
              alt=""
              style={{ height: 160, width: 160, objectFit: 'contain' }}
            />
          </div>
        )}
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold font-display text-gray-800 mb-2">{game.name}</h2>
          <p className="text-gray-500 text-base leading-snug">{game.description}</p>
        </div>
      </div>

      {/* Dots showing position among games */}
      <div className="flex gap-2 mt-6" role="tablist" aria-label="Games">
        {games.map((g, i) => (
          <span
            key={g.id}
            role="tab"
            aria-selected={i === selected}
            className="rounded-full transition-all"
            style={{
              width: i === selected ? 24 : 10,
              height: 10,
              background: i === selected ? themeColor : '#D1D5DB',
            }}
          />
        ))}
      </div>

      {/* 3-button legend — the only supported input */}
      <div className="flex items-center justify-center gap-10 mt-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-wk-blue shadow-[0_6px_0_#0888c4] flex items-center justify-center text-white text-2xl font-bold">
            ◀
          </div>
          <span className="text-sm font-semibold text-gray-600">Previous</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-wk-red shadow-[0_8px_0_#e62e2e] flex items-center justify-center text-white text-3xl font-bold">
            ●
          </div>
          <span className="text-sm font-semibold text-gray-600">Play {game.name}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-wk-yellow shadow-[0_6px_0_#e8ad12] flex items-center justify-center text-white text-2xl font-bold">
            ▶
          </div>
          <span className="text-sm font-semibold text-gray-600">Next</span>
        </div>
      </div>
    </div>
  );
}
