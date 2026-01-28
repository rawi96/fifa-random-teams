// app/actions/getRandomTeams.ts
"use server";

import fs from "fs/promises";
import path from "path";
import { Team } from "../types/team";

let cachedTeams: Team[] | null = null;

function ovrToStars(ovr: number): number {
  if (ovr < 60) return 1;
  if (ovr < 65) return 2;
  if (ovr < 70) return 2.5;
  if (ovr < 73) return 3;
  if (ovr < 76) return 3.5;
  if (ovr < 79) return 4;
  if (ovr < 82) return 4.5;
  return 5;
}

async function loadTeams(): Promise<Team[]> {
  if (cachedTeams) return cachedTeams;

  const filePath = path.join(process.cwd(), "app", "data", "teams.csv");
  console.log("Loading teams from", filePath);
  const raw = await fs.readFile(filePath, "utf-8");

  const lines = raw.split("\n").slice(1); // skip header

  cachedTeams = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [team_id, team_name, ovr] = line.split(",");

      const parsedOvr = Number(ovr);

      return {
        id: Number(team_id),
        name: team_name.replaceAll('"', ""),
        stars: ovrToStars(parsedOvr),
      };
    });

  return cachedTeams;
}

export async function getRandomTeamsByStars(stars: number): Promise<Team[]> {
  const teams = await loadTeams();

  const matching = teams.filter((t) => t.stars === stars);

  if (matching.length < 2) return [];

  const shuffled = [...matching].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}
