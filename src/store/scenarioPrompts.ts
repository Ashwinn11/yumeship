import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';

// ─── Prompt = an evocative scenario seed you write *from* ────────────────────
// Modelled on real selfship/yumeship "imagine your f/o…" writing prompts:
// full, vivid scene starters — not titles.
export type Prompt = { text: string };
export type CustomPrompt = Prompt & { id: string; createdAt: number };

type RelType = 'romantic' | 'platonic' | 'familial';

// Built-in decks. `any` shows for every ship; the rest are merged by the ship's
// relationship type so a familial F/O never gets a romantic prompt, etc.
const BUILTIN: { any: Prompt[] } & Record<RelType, Prompt[]> = {
  any: [
    { text: 'Imagine a thunderstorm knocks the power out — how do the two of you spend the evening?' },
    { text: 'Imagine you fall asleep on their shoulder during a long ride, and they don’t move so they won’t wake you.' },
    { text: 'Imagine getting caught in the rain together with no umbrella, and just laughing about it.' },
    { text: 'Imagine they make your favorite comfort food after they can tell you’ve had a rough day.' },
    { text: 'Imagine a lazy morning where neither of you wants to be the first to get out of bed.' },
    { text: 'Imagine catching them quietly humming a song you love when they think no one’s listening.' },
    { text: 'Imagine the exact moment you first realized how much they meant to you.' },
    { text: 'Imagine you’re both lost in a new city and just decide to wander until you find something.' },
    { text: 'Imagine building a blanket fort and watching old movies until you both drift off.' },
    { text: 'Imagine them noticing the small thing you were too tired to mention, and quietly fixing it.' },
  ],
  romantic: [
    { text: 'Imagine them walking up behind you, wrapping their arms around your waist, and resting their chin on your shoulder.' },
    { text: 'Imagine the quiet moment right before your first kiss.' },
    { text: 'Imagine them catching you staring — and this time, not looking away.' },
    { text: 'Imagine slow dancing in the kitchen at midnight with no music playing.' },
    { text: 'Imagine them tucking a loose strand of hair behind your ear, mid-sentence, like it’s nothing.' },
    { text: 'Imagine the night they finally said “I love you,” and how they said it.' },
    { text: 'Imagine waking up first and getting to watch them sleep for a while.' },
  ],
  platonic: [
    { text: 'Imagine an inside joke that makes you both crack up at the worst possible moment.' },
    { text: 'Imagine staying up all night gaming and ordering far too much food.' },
    { text: 'Imagine them showing up at your door the second you admitted you were having a bad day.' },
    { text: 'Imagine a road trip where the playlist is the entire point of the trip.' },
    { text: 'Imagine the two of you against the world — partners in crime who always have a plan.' },
  ],
  familial: [
    { text: 'Imagine them patching you up and gently lecturing you after you got yourself hurt.' },
    { text: 'Imagine cooking a big, messy meal together and arguing over the recipe.' },
    { text: 'Imagine coming home completely worn out, and they just know exactly what you need.' },
    { text: 'Imagine them patiently teaching you something they’re really good at.' },
    { text: 'Imagine a quiet evening where they remind you, without making it a big deal, that you’re safe.' },
  ],
};

/** Built-in deck for a relationship type (any + that type). */
export function getBuiltinDeck(relType: string | undefined): Prompt[] {
  const key = (relType === 'platonic' || relType === 'familial' ? relType : 'romantic') as RelType;
  return [...BUILTIN.any, ...BUILTIN[key]];
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

// Custom prompts are global (reusable across every ship) and user-owned.
export function getCustomPrompts(): CustomPrompt[] {
  try {
    return (getDb().getAllSync(
      'SELECT * FROM scenario_prompts ORDER BY created_at DESC',
    ) as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      text: r.label as string,
      createdAt: r.created_at as number,
    }));
  } catch {
    // Table not ready yet — degrade gracefully rather than crash.
    return [];
  }
}

export function addCustomPrompt(text: string): string {
  const id = newId();
  getDb().runSync(
    'INSERT INTO scenario_prompts (id, label, created_at) VALUES (?, ?, ?)',
    id, text.trim(), Date.now(),
  );
  notify();
  return id;
}

export function deleteCustomPrompt(id: string) {
  getDb().runSync('DELETE FROM scenario_prompts WHERE id = ?', id);
  notify();
}

export function useCustomPrompts(): CustomPrompt[] {
  const [prompts, setPrompts] = useState<CustomPrompt[]>(() => getCustomPrompts());
  useEffect(() => {
    const fn = () => setPrompts(getCustomPrompts());
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return prompts;
}
