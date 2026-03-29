import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PlayerId = "pascal" | "franciele";

export type ScoreRow = {
  id: string;
  player: PlayerId;
  score: number;
  created_at: string;
};

const SCORE_CAP = 1_000_000;

function getEnv(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

let client: SupabaseClient | null = null;

export function isLeaderboardConfigured(): boolean {
  return getEnv() !== null;
}

function getClient(): SupabaseClient | null {
  if (client) return client;
  const env = getEnv();
  if (!env) return null;
  client = createClient(env.url, env.key);
  return client;
}

export type LeaderboardSnapshot = {
  pascalBest: number;
  francieleBest: number;
  recent: ScoreRow[];
};

export async function fetchLeaderboard(): Promise<LeaderboardSnapshot | null> {
  const sb = getClient();
  if (!sb) return null;

  const [pascalRes, francieleRes, recentRes] = await Promise.all([
    sb.from("scores").select("score").eq("player", "pascal").order("score", { ascending: false }).limit(1),
    sb.from("scores").select("score").eq("player", "franciele").order("score", { ascending: false }).limit(1),
    sb.from("scores").select("id, player, score, created_at").order("created_at", { ascending: false }).limit(12),
  ]);

  if (recentRes.error || !recentRes.data) {
    console.warn("leaderboard fetch", recentRes.error);
    return null;
  }

  const pascalBest = !pascalRes.error && pascalRes.data?.[0] ? pascalRes.data[0].score : 0;
  const francieleBest =
    !francieleRes.error && francieleRes.data?.[0] ? francieleRes.data[0].score : 0;
  return {
    pascalBest,
    francieleBest,
    recent: recentRes.data as ScoreRow[],
  };
}

export async function submitScore(player: PlayerId, score: number): Promise<boolean> {
  const sb = getClient();
  if (!sb) return false;
  const s = Math.max(0, Math.min(SCORE_CAP, Math.floor(score)));
  const { error } = await sb.from("scores").insert({ player, score: s });
  if (error) {
    console.warn("submit score", error);
    return false;
  }
  return true;
}
