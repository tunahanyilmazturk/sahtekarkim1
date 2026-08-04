export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: { type: 'new' | 'improved' | 'fixed'; text: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.4.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Settings sayfası tam ekran modern tasarıma geçirildi' },
      { type: 'improved', text: 'Değişiklik günlüğü (Changelog) eklendi' },
      { type: 'improved', text: 'Tüm bölümlere gradient ikon kutuları eklendi' },
    ]
  },
  {
    version: '1.3.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Profil sayfası tam ekran modern tasarıma güncellendi' },
      { type: 'new', text: 'Profil sayfasına animasyonlu arka plan eklendi' },
      { type: 'improved', text: 'XP progress bar\'a glow efekti eklendi' },
      { type: 'improved', text: 'Arkadaş listesinde AvatarImage kullanılmaya başlandı' },
      { type: 'improved', text: 'Aksiyon butonları sticky alt çubuğa taşındı' },
    ]
  },
  {
    version: '1.2.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Liderlik tablosu podium sistemiyle yeniden tasarlandı' },
      { type: 'new', text: '4 kategori eklendi: Galibiyet, Başarı %, Oyun, Coin' },
      { type: 'new', text: 'Animasyonlu podium ile ilk 3 oyuncu özel gösterim kazandı' },
      { type: 'new', text: 'Kullanıcı kendi sırasını altta görebiliyor' },
      { type: 'improved', text: 'Tam ekran tasarım ve animasyonlu arka plan eklendi' },
    ]
  },
  {
    version: '1.1.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Sosyal sayfa modern UI ile yeniden tasarlandı' },
      { type: 'new', text: 'Sosyal sayfaya kullanıcı istatistik kartı eklendi' },
      { type: 'improved', text: 'Arkadaş listesi Çevrimiçi/Çevrimdışı olarak ayrıldı' },
      { type: 'improved', text: 'Tüm kullanıcı kartlarına AvatarImage eklendi' },
      { type: 'improved', text: 'Arama sayfasına hızlı istatistik kartları eklendi' },
      { type: 'improved', text: 'Tab geçişlerine animasyonlu aktif gösterge eklendi' },
    ]
  },
  {
    version: '1.0.2',
    date: '30 Mar 2025',
    type: 'minor',
    changes: [
      { type: 'improved', text: 'Ana menü premium kullanıcı kartı ve istatistiklerle güncellendi' },
      { type: 'new', text: 'Çevrimiçi oyuncu sayısı banner\'ı eklendi' },
      { type: 'improved', text: 'Hızlı oda katılımı input\'u eklendi' },
      { type: 'improved', text: 'Gradient arkaplan ve animasyonlu emoji elementler eklendi' },
    ]
  },
  {
    version: '1.0.1',
    date: '29 Mar 2025',
    type: 'minor',
    changes: [
      { type: 'new', text: '44 avatar ile Avatar Mağazası sistemi eklendi' },
      { type: 'new', text: '5 avatar kategorisi: Ücretsiz, Yaygın, Nadir, Epik, Efsane' },
      { type: 'new', text: 'SVG tabanlı AvatarImage bileşeni oluşturuldu' },
      { type: 'new', text: 'Supabase\'e avatar, owned_avatars, coins kolonları eklendi' },
      { type: 'fixed', text: 'Lucide Coins ikonu CircleDollarSign ile değiştirildi' },
    ]
  },
  {
    version: '1.0.0',
    date: '28 Mar 2025',
    type: 'major',
    changes: [
      { type: 'new', text: 'Sahtekar Kim? oyunu yayına alındı' },
      { type: 'new', text: 'Çevrimiçi ve çevrimdışı oyun modları' },
      { type: 'new', text: 'Gerçek zamanlı arkadaş sistemi' },
      { type: 'new', text: 'Sohbet, oylama ve oyun sonu ekranları' },
      { type: 'new', text: 'Kullanıcı profili ve istatistikleri' },
    ]
  }
];
