# 🎭 Sahtekar Kim? - Online Deduction Game

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Türkçe sosyal dedüksiyon oyunu** - Arkadaşlarınla birlikte kimin sahtekar olduğunu bulmaya çalış!

## 🎮 Oyun Hakkında

Sahtekar Kim?, Among Us ve benzeri dedüksiyon oyunlarından esinlenen, çok oyunculu bir kelime tahmin oyunudur. Oyuncular arasında gizli bir sahtekar bulunur ve diğer oyuncular onu bulmaya çalışır.

### 🎯 Oyun Nasıl Oynanır?

1. **Rol Dağılımı**: Oyunculardan biri rastgele "Sahtekar" olarak seçilir
2. **Kelime Görevi**: Vatandaşlar aynı kelimeyi alır, sahtekar farklı bir kelime alır
3. **Sohbet ve İpuçları**: Oyuncular birbirlerine soru sorarak ipuçları toplar
4. **Tahmin Aşaması**: Herkes kimin sahtekar olduğunu tahmin eder
5. **Sonuç**: Doğru tahmin edenler puan kazanır

### ✨ Özellikler

- 🌐 **Çevrimiçi ve Çevrimdışı Mod**: İnternet üzerinden oyna veya yerel olarak arkadaşlarınla
- 🤖 **Akıllı Botlar**: Yalnız oynarken zorlu AI rakipleri
- 👥 **Oda Sistemi**: Özel odalar oluştur, şifre koruması ekle
- 💬 **Gerçek Zamanlı Sohbet**: Anlık mesajlaşma ve emoji desteği
- 🏆 **Liderlik Tablosu**: En iyi oyuncuları görüntüle
- 🎨 **Modern Arayüz**: React 19 ve Tailwind CSS ile şık tasarım
- 🔊 **Ses Efektleri**: Oyun deneyimini zenginleştiren sesler
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu

## 🛠️ Teknoloji Yığını

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Veritabanı**: Supabase (PostgreSQL)
- **Gerçek Zamanlı**: Supabase Realtime
- **Build Tool**: Vite
- **Animasyonlar**: Motion (Framer Motion)
- **Iconlar**: Lucide React

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adım 1: Projeyi Klonla
```bash
git clone https://github.com/tunahanyilmazturk/sahtekarkim1.git
cd sahtekarkim1
```

### Adım 2: Bağımlılıkları Yükle
```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarla
```bash
# .env.example dosyasını kopyala
cp .env.example .env.local
```

`.env.local` dosyasına aşağıdaki anahtarları ekle:
```env
# Supabase (projede zaten var)
VITE_SUPABASE_URL="https://lunufxlcpnwcqwtvbjfl.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Gemini AI (isteğe bağlı)
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Adım 4: Geliştirme Sunucusunu Başlat
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
sahtekarkim1/
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── Auth.tsx        # Kullanıcı kimlik doğrulama
│   │   ├── Menu.tsx        # Ana menü
│   │   ├── Chat.tsx        # Sohbet sistemi
│   │   ├── Voting.tsx      # Oylama sistemi
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useGame.ts      # Oyun mantığı
│   │   ├── useOfflineGame.ts # Çevrimdışı oyun
│   │   └── ...
│   ├── lib/                # Yardımcı kütüphaneler
│   │   ├── supabase.ts     # Veritabanı bağlantısı
│   │   ├── constants.ts    # Oyun sabitleri
│   │   └── ...
│   └── types/              # TypeScript tipleri
├── server.ts               # Express sunucusu
├── supabase-schema.sql     # Veritabanı şeması
└── package.json
```

## 🎮 Oyun Modları

### 🌐 Çevrimiçi Mod
- Supabase üzerinden gerçek zamanlı çok oyunculu oyun
- Oda oluşturma ve katılma
- Arkadaşlık sistemi ve liderlik tablosu

### 📱 Çevrimdışı Mod
- Yerel çok oyunculu oyun (aynı cihazda)
- AI bot desteği
- İnternet bağlantısı gerektirmez

## 🎯 Oyun Ayarları

- **Kategoriler**: Hayvanlar, Yemekler, Meslekler, Şehirler ve daha fazlası
- **Zaman Ayarları**: Tur süresi (30-120 saniye)
- **Oyun Süresi**: Toplam tur sayısı (3-10 tur)
- **Zorluk Seviyesi**: Kolay, Orta, Zor
- **Puanlama**: Esnek puan sistemi

## 🔧 Geliştirme Komutları

```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Build önizleme
npm run lint     # TypeScript kontrolü
npm run clean    # Build dosyalarını temizle
```

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull Request aç

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.

## 🐞 Hata Bildirimi

Sorun ve öneriler için GitHub Issues kullanabilirsin.

---

**İyi eğlenceler! 🎭**
