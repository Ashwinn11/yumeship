import { useEffect, useState } from 'react';
import { getDb, newId } from '@/db/client';

// ─── Prompt = an evocative scenario seed you write *from* ────────────────────
// 30 prompts modelled on the community's favorite shapes: soft "your f/o…"
// fragments, reaction prompts, ask-game questions, AU/destiny, seasonal
// domestic, and care-taking. No "imagine…" frame — the writer already knows.
export type Prompt = { text: string };
export type CustomPrompt = Prompt & { id: string; createdAt: number };

type RelType = 'romantic' | 'platonic' | 'familial';

// Built-in decks. `any` shows for every ship; the rest are merged by the ship's
// relationship type so a familial F/O never gets a romantic prompt, etc.
const BUILTIN: { any: Prompt[] } & Record<RelType, Prompt[]> = {
  any: [
    { text: 'Destined to find each other in every universe. What does it look like in this one?' },
    { text: 'You show them your favorite movie, mostly to watch their face during the good parts.' },
    { text: 'They’re sick in bed for once, and it’s your turn to take care of them.' },
    { text: 'What’s their contact name in your phone — and yours in theirs?' },
    { text: 'You teach them the game you’re best at. They’re terrible. It’s perfect.' },
    { text: 'The first snow of the season, and they call you to the window to watch.' },
    { text: 'What do they think about you when you’re not around?' },
    { text: 'They’re not from your world — you hand them your phone and wait for the reaction.' },
    { text: 'A thunderstorm knocks the power out. How do the two of you spend the evening?' },
    { text: 'They can tell you’ve had a rough day — your favorite comfort food is already waiting.' },
    { text: 'Caught in the rain, no umbrella, and neither of you even minds.' },
    { text: 'They notice the small thing you were too tired to mention — and quietly fix it.' },
  ],
  romantic: [
    { text: 'They walk up behind you, wrap their arms around your waist, and rest their chin on your shoulder.' },
    { text: 'The quiet moment right before your first kiss.' },
    { text: 'They catch you staring — and this time, neither of you looks away.' },
    { text: 'Slow dancing in the kitchen at midnight, no music playing.' },
    { text: 'Hot chocolate on a cold evening, sharing one blanket that’s too small on purpose.' },
    { text: 'Mid-sentence, they tuck a loose strand of hair behind your ear like it’s nothing.' },
    { text: 'The night they finally said “I love you” — and exactly how they said it.' },
    { text: 'You wake up first, and get to watch them sleep for a while.' },
  ],
  platonic: [
    { text: 'An inside joke sets you both off at the worst possible moment.' },
    { text: 'Up all night gaming, with far too much food ordered.' },
    { text: 'You admit you’re having a bad day. They’re at your door before you finish typing the next message.' },
    { text: 'A road trip where the playlist is the entire point of the trip.' },
    { text: 'The two of you get dropped into a horror movie. What roles do you each end up with?' },
  ],
  familial: [
    { text: 'They patch you up, gently lecturing you the whole time about getting yourself hurt.' },
    { text: 'A big, messy meal cooked together, arguing over the recipe the whole way.' },
    { text: 'You come home completely worn out, and they just know exactly what you need.' },
    { text: 'They patiently teach you something they’re really good at.' },
    { text: 'A quiet evening where they remind you, without making it a big deal, that you’re safe.' },
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
