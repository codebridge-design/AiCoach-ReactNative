import { Response } from 'express';
import { supabase } from '../config/supabase';
import { calcReadinessScore } from '../services/analytics.service';

export async function getSummary(req: any, res: Response) {
  const [{ data: profile }, { data: sessions }, { data: answers }] = await Promise.all([
    supabase.from('profiles').select('streak_count').eq('id', req.userId).single(),
    supabase.from('sessions').select('total_score, created_at').eq('user_id', req.userId).eq('status', 'completed').order('created_at', { ascending: false }),
    supabase.from('answers').select('score').eq('user_id', req.userId).not('score', 'is', null),
  ]);

  const scores = (answers ?? []).map((a: any) => a.score).filter((s: any) => s != null);
  const avg_score = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
  const last7Scores = (sessions ?? []).slice(0, 7).map((s: any) => s.total_score ?? 0);
  const avgLast7 = last7Scores.length ? last7Scores.reduce((a: number, b: number) => a + b, 0) / last7Scores.length : 0;
  const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sessionsLast30 = (sessions ?? []).filter((s: any) => s.created_at >= thirtyAgo).length;

  res.json({
    readiness_score: calcReadinessScore({ avgScoreLast7: avgLast7, streakCount: profile?.streak_count ?? 0, sessionsLast30 }),
    avg_score: Math.round(avg_score * 10) / 10,
    streak: profile?.streak_count ?? 0,
    sessions_count: sessions?.length ?? 0,
  });
}

export async function getHistory(req: any, res: Response) {
  const days = Number(req.query.days ?? 30);
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const { data, error } = await supabase.from('analytics_snapshots').select('*').eq('user_id', req.userId).gte('snapshot_date', from).order('snapshot_date');
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ snapshots: data });
}

export async function getWeakTopics(req: any, res: Response) {
  const { data: answers } = await supabase.from('answers').select('score, questions(topic)').eq('user_id', req.userId).not('score', 'is', null);
  const topicMap: Record<string, number[]> = {};
  (answers ?? []).forEach((a: any) => {
    const topic = a.questions?.topic;
    if (topic) { if (!topicMap[topic]) topicMap[topic] = []; topicMap[topic].push(a.score); }
  });
  const topics = Object.entries(topicMap).map(([name, scores]) => ({
    name, avg_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10, count: scores.length,
  })).sort((a, b) => a.avg_score - b.avg_score);
  res.json({ topics });
}

export async function getProgress(req: any, res: Response) {
  const { from, to } = req.query;
  let q = supabase.from('analytics_snapshots').select('*').eq('user_id', req.userId).order('snapshot_date');
  if (from) q = q.gte('snapshot_date', from);
  if (to) q = q.lte('snapshot_date', to);
  const { data, error } = await q;
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
}
