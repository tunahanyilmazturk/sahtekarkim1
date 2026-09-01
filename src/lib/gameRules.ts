import type { Player, PlayerRole, Winner } from '../types';

type VotingPlayer = Pick<Player, 'id' | 'name'> & { role?: PlayerRole | null };

export interface VotingResult {
  winner: Winner;
  reason: 'tie' | 'impostor_found' | 'citizen_eliminated';
  impostor: VotingPlayer;
  votedOut: VotingPlayer | null;
}

export function normalizeTurkishText(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR').normalize('NFC');
}

export function isCorrectGuess(guess: string, word: string): boolean {
  return normalizeTurkishText(guess) === normalizeTurkishText(word);
}

export function resolveVoting(
  players: VotingPlayer[],
  votes: Record<string, string>,
): VotingResult {
  if (players.length < 2) throw new Error('Oylama için en az iki oyuncu gerekir.');

  const playerIds = new Set(players.map(player => player.id));
  const impostors = players.filter(player => player.role === 'impostor');
  if (impostors.length !== 1) throw new Error('Oyunda tam olarak bir sahtekar olmalıdır.');

  for (const [voterId, targetId] of Object.entries(votes)) {
    if (!playerIds.has(voterId)) throw new Error('Geçersiz oy kullanan oyuncu.');
    if (!playerIds.has(targetId)) throw new Error('Geçersiz oy hedefi.');
    if (voterId === targetId) throw new Error('Oyuncu kendisine oy veremez.');
  }

  if (Object.keys(votes).length !== players.length) {
    throw new Error('Sonuç için tüm oyuncular oy vermelidir.');
  }

  const counts = new Map<string, number>();
  for (const targetId of Object.values(votes)) {
    counts.set(targetId, (counts.get(targetId) ?? 0) + 1);
  }

  const maxVotes = Math.max(...counts.values());
  const leaders = [...counts.entries()].filter(([, count]) => count === maxVotes);
  const impostor = impostors[0];

  if (leaders.length !== 1) {
    return { winner: 'impostor', reason: 'tie', impostor, votedOut: null };
  }

  const votedOut = players.find(player => player.id === leaders[0][0])!;
  return votedOut.id === impostor.id
    ? { winner: 'citizens', reason: 'impostor_found', impostor, votedOut }
    : { winner: 'impostor', reason: 'citizen_eliminated', impostor, votedOut };
}
