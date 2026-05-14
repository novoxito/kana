// Simplified SM-2 spaced repetition.
// Quality grades: 0 = again, 3 = hard, 4 = good, 5 = easy.

import { getProgress, saveProgress } from './store.js';

const DAY = 24 * 60 * 60 * 1000;

export function review(id, quality) {
  const p = { ...getProgress(id) };
  p.total = (p.total || 0) + 1;

  if (quality < 3) {
    p.reps = 0;
    p.interval = 0;
    p.lapses = (p.lapses || 0) + 1;
    p.due = Date.now() + 10 * 60 * 1000; // 10 min for relearn
  } else {
    p.correct = (p.correct || 0) + 1;
    p.reps = (p.reps || 0) + 1;
    if (p.reps === 1) p.interval = 1;
    else if (p.reps === 2) p.interval = 3;
    else p.interval = Math.round(p.interval * p.ease);

    const q = quality;
    p.ease = Math.max(1.3, p.ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

    p.due = Date.now() + p.interval * DAY;
  }
  saveProgress(id, p);
  return p;
}

// Pick next card: prioritize overdue, then new, then least-known.
export function nextCard(candidateIds) {
  if (!candidateIds.length) return null;
  const now = Date.now();
  const scored = candidateIds.map(id => {
    const p = getProgress(id);
    let score;
    if (p.reps === 0) score = 1000; // new -> high priority
    else if (p.due <= now) score = 2000 + (now - p.due) / DAY; // overdue
    else score = -((p.due - now) / DAY); // not due, deprioritize
    return { id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  // Among top tier, randomize a bit
  const top = scored.filter(s => s.score >= scored[0].score - 1);
  return top[Math.floor(Math.random() * top.length)].id;
}
