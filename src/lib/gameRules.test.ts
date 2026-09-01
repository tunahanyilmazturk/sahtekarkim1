import { describe, expect, it } from 'vitest';
import type { Player } from '../types';
import { isCorrectGuess, resolveVoting } from './gameRules';

const players: Player[] = [
  { id: 'i', name: 'Sahtekar', avatar: '', isHost: false, score: 0, isReady: true, role: 'impostor' },
  { id: 'a', name: 'Ayşe', avatar: '', isHost: true, score: 0, isReady: true, role: 'citizen' },
  { id: 'b', name: 'Bora', avatar: '', isHost: false, score: 0, isReady: true, role: 'citizen' },
];

describe('resolveVoting', () => {
  it('sahtekar çoğunluk oyu aldığında vatandaşları kazandırır', () => {
    expect(resolveVoting(players, { i: 'a', a: 'i', b: 'i' })).toMatchObject({
      winner: 'citizens', reason: 'impostor_found', votedOut: { id: 'i' },
    });
  });

  it('beraberliği sahtekar lehine sonuçlandırır', () => {
    const fourPlayers = [...players, { ...players[2], id: 'c', name: 'Cem' }];
    expect(resolveVoting(fourPlayers, { i: 'a', a: 'i', b: 'a', c: 'i' })).toMatchObject({
      winner: 'impostor', reason: 'tie', votedOut: null,
    });
  });

  it.each([
    ['eksik oy', { i: 'a', a: 'i' }],
    ['kendine oy', { i: 'i', a: 'i', b: 'i' }],
    ['olmayan hedef', { i: 'x', a: 'i', b: 'i' }],
  ])('%s verisini reddeder', (_label, votes) => {
    expect(() => resolveVoting(players, votes)).toThrow();
  });
});

describe('isCorrectGuess', () => {
  it.each([
    [' İSTANBUL ', 'istanbul'],
    ['ÇİLEK', 'çilek'],
    ['Aşk-ı Memnu', 'aşk-ı memnu'],
  ])('Türkçe metni doğru karşılaştırır: %s', (guess, word) => {
    expect(isCorrectGuess(guess, word)).toBe(true);
  });
});
