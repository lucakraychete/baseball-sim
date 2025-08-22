import { useState, Fragment } from 'react';
import { generatePitchers } from '@/lib/generatePitchers';
import { Pitcher, Pitch } from '@/types/player';
import { RatingRing } from '@/components/ui/RatingRing';

const pct = (n?: number) => (n == null || Number.isNaN(n) ? '—' : `${Math.round(n * 100)}%`);

function derivePitchRates(p: Pitch) {
  const g = p.game;
  if (!g) return { csw: 0, whiffSwing: 0, zone: 0, gb: 0 };
  const csw = (g.calledStrikes + g.whiffs) / Math.max(1, g.thrown);
  const whiffSwing = g.whiffs / Math.max(1, g.swings);
  const zone = g.inZone / Math.max(1, g.thrown);
  const gb = g.grounders / Math.max(1, g.ballsInPlay);
  return { csw, whiffSwing, zone, gb };
}

function SmallRatingRing({ value }: { value: number }) {
  return <RatingRing value={value} size={35} fontSize="0.8rem" />;
}

function PitchArsenalList({ mix }: { mix: Pitch[] }) {
  if (!mix?.length) return null;
  const sorted = [...mix].sort((a, b) => (b.usage ?? 0) - (a.usage ?? 0));
  return (
    <div className="mt-6">
      <h4 className="font-semibold text-sm mb-2">Pitch Arsenal</h4>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {sorted.map((p, i) => (
          <li
            key={`${p.type}-${i}`}
            className="py-1 flex items-center justify-between text-[11px] leading-tight"
          >
            <span className="font-medium">{p.type}</span>
            <span className="text-neutral-500">{pct(p.usage)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PitchArsenalTable({ mix }: { mix: Pitch[] }) {
  if (!mix?.length) return null;
  return (
    <div className="mt-3 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
      <table className="min-w-full text-[11px] leading-tight">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            <th className="px-2 py-1 text-left font-semibold">Type</th>
            <th className="px-2 py-1 text-center font-semibold">Usage</th>
            <th className="px-1 py-1 text-center font-semibold">Shape</th>
            <th className="px-1 py-1 text-center font-semibold">Velo</th>
            <th className="px-1 py-1 text-center font-semibold">Spin</th>
            <th className="px-1 py-1 text-center font-semibold">IVB</th>
            <th className="px-1 py-1 text-center font-semibold">IHB</th>
            <th className="px-1 py-1 text-center font-semibold">CMD</th>
            <th className="px-1 py-1 text-center font-semibold">spinEff</th>
            <th className="px-1 py-1 text-center font-semibold">rpm</th>
            <th className="px-1 py-1 text-center font-semibold">gyro</th>
            <th className="px-1 py-1 text-center font-semibold">axis</th>
            <th className="px-1 py-1 text-center font-semibold">CSW</th>
          </tr>
        </thead>
        <tbody>
          {mix.map((pitch, i) => {
            const rates = derivePitchRates(pitch);
            const r = pitch.ratings;
            return (
              <tr key={`${pitch.type}-${i}`} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="px-2 py-1 font-medium whitespace-nowrap">{pitch.type}</td>
                <td className="px-2 py-1 text-center">{pct(pitch.usage)}</td>

                <td className="px-1 py-1 text-center">{r ? <SmallRatingRing value={r.shapeScore.rating20_80} /> : '—'}</td>
                <td className="px-1 py-1 text-center">{r ? <SmallRatingRing value={r.velocity.rating20_80} /> : '—'}</td>
                <td className="px-1 py-1 text-center">{r ? <SmallRatingRing value={r.spin.rating20_80} /> : '—'}</td>
                <td className="px-1 py-1 text-center">{r ? <SmallRatingRing value={r.verticalBreak.rating20_80} /> : '—'}</td>
                <td className="px-1 py-1 text-center">{r ? <SmallRatingRing value={r.horizontalBreak.rating20_80} /> : '—'}</td>
                <td className="px-1 py-1 text-center">{r ? <SmallRatingRing value={r.command.rating20_80} /> : '—'}</td>

                <td className="px-1 py-1 text-center">{pitch.spinEff?.toFixed(2) ?? '—'}</td>
                <td className="px-1 py-1 text-center">{pitch.spinRate ?? '—'}</td>
                <td className="px-1 py-1 text-center">{pitch.gyroDegree ?? '—'}</td>
                <td className="px-1 py-1 text-center">{pitch.spinDirection ?? '—'}</td>
                <td className="px-1 py-1 text-center">{pct(rates.csw)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// The rest of your file continues here unchanged...
// (ExpandedPanel, RatingGrid, SummaryRow, renderTable, etc.)


export default function Roster() {
  const [players, setPlayers] = useState<Pitcher[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const promoteTo = (id: string, newSpot: Pitcher['rosterSpot']) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rosterSpot: newSpot } : p))
    );
  };

  const categorized = {
    Starter: players.filter((p) => p.rosterSpot === 'Starter'),
    Reliever: players.filter((p) => p.rosterSpot === 'Reliever'),
    Farm: players.filter((p) => p.rosterSpot === 'Farm'),
  };

  const SummaryRow = ({ p }: { p: Pitcher }) => (
    <div className="grid grid-cols-5 gap-6 text-sm">
      <div><span className="text-neutral-500 mr-1">OVR</span><span className="text-red-500 font-semibold">{p.overall}</span></div>
      <div><span className="text-neutral-500 mr-1">POT</span><span className="text-green-500 font-semibold">{p.potential}</span></div>
      <div><span className="text-neutral-500 mr-1">Age</span>{p.age}</div>
      <div><span className="text-neutral-500 mr-1">Throws</span>{p.throws}</div>
      <div><span className="text-neutral-500 mr-1">AAV</span>${p.contractAAV.toFixed(1)}M</div>
    </div>
  );

  const RatingGrid = ({ p }: { p: Pitcher }) => (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-y-5 gap-x-6">
      {[
        ['Velocity', p.velocity],
        ['Movement', p.movement],
        ['Control', p.control],
        ['Command', p.command],
        ['Durability', p.durability],
        ['Development', p.development],
      ].map(([label, value]) => (
        <div key={label as string} className="flex flex-col items-start gap-1">
          <span className="font-medium text-sm">{label as string}</span>
          <RatingRing value={value as number} size={52} />
        </div>
      ))}
    </div>
  );

  const ExpandedPanel = ({ p }: { p: Pitcher }) => (
    <tr>
      <td colSpan={8} className="px-6 py-5 text-sm">
        <div className="mb-4 flex items-start justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">{p.name}</h3>
            <p className="text-neutral-500 -mt-0.5">Scouting Report</p>
          </div>
          <SummaryRow p={p} />
        </div>

        {/* Overall rings */}
        <RatingGrid p={p} />

        {/* Pitch ratings directly below */}
        <PitchArsenalList mix={p.pitchMix} />
        <PitchArsenalTable mix={p.pitchMix} />

        {/* Footnotes */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div><span className="text-neutral-500">Prospect Tier:</span> <span className="font-medium">{p.prospectTier}</span></div>
          <div><span className="text-neutral-500">Projection Δ:</span> {p.projectionDelta}</div>
          <div><span className="text-neutral-500">Arm Angle:</span> {p.armAngle}</div>
        </div>
      </td>
    </tr>
  );

  const renderTable = (title: string, data: Pitcher[]) => (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-8">
      <div className="bg-neutral-100 dark:bg-neutral-800 px-5 py-3 font-semibold">{title}</div>
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2">OVR</th>
            <th className="px-3 py-2">POT</th>
            <th className="px-3 py-2">Age</th>
            <th className="px-3 py-2">Throws</th>
            <th className="px-3 py-2">Stamina</th>
            <th className="px-3 py-2">AAV</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <Fragment key={p.id}>
              <tr className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2"><RatingRing value={p.overall} /></td>
                <td className="px-3 py-2"><RatingRing value={p.potential} /></td>
                <td className="px-3 py-2">{p.age}</td>
                <td className="px-3 py-2">{p.throws}</td>
                <td className="px-3 py-2">{p.stamina}</td>
                <td className="px-3 py-2">${p.contractAAV.toFixed(1)}M</td>
                <td className="px-3 py-2 space-x-2">
                  {p.rosterSpot !== 'Starter' && (
                    <button onClick={() => promoteTo(p.id, 'Starter')} className="text-xs text-green-500">To Starter</button>
                  )}
                  {p.rosterSpot !== 'Reliever' && (
                    <button onClick={() => promoteTo(p.id, 'Reliever')} className="text-xs text-blue-500">To Bullpen</button>
                  )}
                  {p.rosterSpot !== 'Farm' && (
                    <button onClick={() => promoteTo(p.id, 'Farm')} className="text-xs text-yellow-500">To Farm</button>
                  )}
                  <button
                    onClick={() => toggleExpand(p.id)}
                    className="text-xs text-brand-500 underline"
                  >
                    {expanded[p.id] ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expanded[p.id] && <ExpandedPanel p={p} />}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="space-y-8 px-4 md:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pitching Roster</h1>
        <button
          onClick={() => setPlayers((prev) => [...prev, ...generatePitchers()])}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 text-sm"
        >
          Add 5 SP, 10 RP, 10 Farm
        </button>
      </div>

      {players.length === 0 ? (
        <p className="text-neutral-500">No players yet. Click above to generate pitchers.</p>
      ) : (
        <>
          {renderTable('Starting Rotation', categorized.Starter)}
          {renderTable('Bullpen / Relievers', categorized.Reliever)}
          {renderTable('Farm System', categorized.Farm)}
        </>
      )}
    </section>
  );
}
