export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'wins' | 'games' | 'social' | 'special';
  threshold: number;
  reward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'İlk Zafer', description: 'İlk oyununu kazan', icon: '🏆', category: 'wins', threshold: 1, reward: 50 },
  { id: 'wins_10', title: 'Galeri', description: '10 oyun kazan', icon: '🥇', category: 'wins', threshold: 10, reward: 200 },
  { id: 'wins_50', title: 'Efsane', description: '50 oyun kazan', icon: '👑', category: 'wins', threshold: 50, reward: 500 },
  { id: 'wins_100', title: 'Hükümdar', description: '100 oyun kazan', icon: '💎', category: 'wins', threshold: 100, reward: 1000 },

  { id: 'games_10', title: 'Acemi', description: '10 oyun oyna', icon: '🎮', category: 'games', threshold: 10, reward: 50 },
  { id: 'games_50', title: 'Oyuncu', description: '50 oyun oyna', icon: '🎯', category: 'games', threshold: 50, reward: 150 },
  { id: 'games_100', title: 'Bağımlı', description: '100 oyun oyna', icon: '🔥', category: 'games', threshold: 100, reward: 300 },

  { id: 'friends_1', title: 'Sosyal', description: '1 arkadaş edin', icon: '🤝', category: 'social', threshold: 1, reward: 30 },
  { id: 'friends_5', title: 'Popüler', description: '5 arkadaş edin', icon: '👥', category: 'social', threshold: 5, reward: 100 },
  { id: 'friends_10', title: 'Sosyal Medya', description: '10 arkadaş edin', icon: '🌟', category: 'social', threshold: 10, reward: 250 },

  { id: 'impostor_5', title: 'Sahtekar Ustası', description: '5 kez sahtekar olarak kazan', icon: '🎭', category: 'special', threshold: 5, reward: 200 },
  { id: 'citizen_5', title: 'Vatandaş Kahramanı', description: '5 kez vatandaş olarak kazan', icon: '🛡️', category: 'special', threshold: 5, reward: 200 },
  { id: 'guess_correct', title: 'Zihin Okuyucu', description: '3 kez sahtekarı doğru tahmin et', icon: '🔮', category: 'special', threshold: 3, reward: 150 },
];

export function getUnlockedAchievements(stats: {
  wins: number;
  gamesPlayed: number;
  friendsCount: number;
  impostorWins: number;
  citizenWins: number;
  correctGuesses: number;
}): Achievement[] {
  return ACHIEVEMENTS.filter(a => {
    switch (a.category) {
      case 'wins': return stats.wins >= a.threshold;
      case 'games': return stats.gamesPlayed >= a.threshold;
      case 'social': return stats.friendsCount >= a.threshold;
      case 'special':
        if (a.id === 'impostor_5') return stats.impostorWins >= a.threshold;
        if (a.id === 'citizen_5') return stats.citizenWins >= a.threshold;
        if (a.id === 'guess_correct') return stats.correctGuesses >= a.threshold;
        return false;
      default: return false;
    }
  });
}

export function getAchievementProgress(
  achievement: Achievement,
  stats: { wins: number; gamesPlayed: number; friendsCount: number; impostorWins: number; citizenWins: number; correctGuesses: number }
): number {
  let current = 0;
  switch (achievement.category) {
    case 'wins': current = stats.wins; break;
    case 'games': current = stats.gamesPlayed; break;
    case 'social': current = stats.friendsCount; break;
    case 'special':
      if (achievement.id === 'impostor_5') current = stats.impostorWins;
      else if (achievement.id === 'citizen_5') current = stats.citizenWins;
      else if (achievement.id === 'guess_correct') current = stats.correctGuesses;
      break;
  }
  return Math.min(100, Math.round((current / achievement.threshold) * 100));
}
