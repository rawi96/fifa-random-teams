"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { getRandomTeamsByStars } from "./actions/get-random-teams";
import { Team } from "./types/team";

function getRandomStars() {
  return Math.floor(Math.random() * 5) + 1; // 1–5
}

export default function Page() {
  const [stars, setStars] = useState<number | "">("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load initial random stars + teams on first mount
  useEffect(() => {
    const initialStars = getRandomStars();
    setStars(initialStars);

    startTransition(async () => {
      const result = await getRandomTeamsByStars(initialStars);
      setTeams(result);
    });
  }, []);

  function loadTeams() {
    if (stars === "") return;

    startTransition(async () => {
      const result = await getRandomTeamsByStars(stars);
      setTeams(result);
    });
  }

  const displayTeams: (Team | null)[] =
    teams.length === 2 ? teams : [null, null];

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-10">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center">
        EA FC Team Picker
      </h1>

      {/* Controls */}
      <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mb-8">
        <select
          value={stars}
          onChange={(e) => setStars(Number(e.target.value))}
          disabled={isPending}
          className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>
              {s} ⭐
            </option>
          ))}
        </select>

        <button
          onClick={loadTeams}
          disabled={stars === "" || isPending}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-lg font-semibold text-black transition hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Load
        </button>
      </div>

      {/* Cards */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center gap-6">
        {displayTeams.map((team, index) => (
          <Fragment key={index}>
            {team ? (
              <a
                key={team.id}
                href={`https://www.cmtracker.net/en/teams/${team.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group w-full md:w-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-emerald-500 ${
                  isPending ? "opacity-60" : ""
                }`}
              >
                <p className="text-xl font-semibold mb-1">{team.name}</p>
                <p className="text-zinc-400">{team.stars} ⭐</p>

                <p className="mt-4 text-sm text-zinc-500 group-hover:text-emerald-400 transition">
                  View on CMTracker →
                </p>
              </a>
            ) : (
              <div
                key={index}
                className="w-full md:w-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <p className="text-xl font-semibold mb-1">— — — — —</p>
                <p className="text-zinc-400">— ⭐</p>
              </div>
            )}

            {/* VS divider */}
            {index === 0 && (
              <div className="text-zinc-500 font-bold text-lg md:px-2">VS</div>
            )}
          </Fragment>
        ))}
      </div>
    </main>
  );
}
