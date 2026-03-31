import type { Player, Message } from '../types';

// Her kelime için ilgili ipuçları - kelimeye yakın ama kelime kendisi değil
const WORD_HINTS: Record<string, string[]> = {
  // Hayvanlar
  "Aslan": ["yele", "kükreme", "Afrika", "pençe", "vahşi", "kral", "yırtıcı", "güçlü", "dev kedi", "savana"],
  "Fil": ["hortum", "dişler", "dev", "Afrika savanası", "fıstık", "ağır", "deri", "kulaklar", "otçul", "büyük"],
  "Köpek": ["havlama", "kuyruk", "kemik", "sahip", "sadakat", "tas", "tasma", "pati", "dost", "mama"],
  "Kedi": ["miyav", "pençe", "miyav sesi", "fare", "şapşik", "tüy", "yumuşak", "tırmanma", "süt", "oyuncak"],
  "Penguen": ["buz", "kısa kanatlar", "siyah beyaz", "balık yiyen", "yüzme", "Antarktika", "tüy", "yuvarlanma", "deniz"],
  "Kaplumbağa": ["kabuk", "yavaş", "deniz", "çok yaşayan", "sürüngen", "plastron", "omurga", "kuru kara", "ot"],
  "Yılan": ["zehir", "dil", "sürünme", "kabuk soyma", "fare yiyen", "ısırık", "yerde sürünme", "ağız"],
  "Kurbağa": ["atlama", "bataklık", "sinek yemek", "tadpole", "vırıldama", "su", "yeşil", "zıplama"],
  "Papağan": ["renkli", "tekrar etme", "kanatlar", "gaga", "tropikal", "dil", "tünek", "meyve"],
  "Arı": ["bal", "balmumu", "iğne", "çiçek", "uçma", "kovan", "sarı siyah", "nektar", "petek"],
  "Zürafa": ["uzun boyun", "Afika", "yükseklik", "leke", "ağaç yaprağı", "koşma", "boynu"],
  "Timsah": ["nehir", "dişler", "çene", "Nil", "sürüngen", "yüzme", "sivri dişler", "avlanma"],

  // Yemekler
  "Pizza": ["fırın", "dilim", "peynir", "hamur", "domates sosu", "dilimlenmiş", "yuvarlak", "mozzarella", "İtalya"],
  "Hamburger": ["et köfte", "ekmek arası", "sos", "patates", "fast food", "soğan", "marul", "salatalık"],
  "Kebap": ["kömür", "şiş", "mangal", "et", "közlenmiş", "biber", "domates", "ateş", "ocak"],
  "Makarna": ["kaynatma", "İtalyan", "sarımsaklı", "spagetti", "fettuccine", "sos", "penne", "haşlama"],
  "Döner": ["dikey şiş", "ekmek", "dilimlenmiş et", "tomatsalata", "dönen", "lokanta", "tavuk veya et"],
  "Lahmacun": ["ince hamur", "kıyma", "maydanoz", "limon", "fırın", "ince ekmek", "sarma"],
  "Mantı": ["kıyma dolgu", "yoğurt", "sarımsak sos", "hamur", "küçük", "buharda pişirme", "kırmızı sos"],
  "Simit": ["susam", "halka", "çıtır", "fırın", "ekmek", "kahvaltı", "açık satış", "çay yanı"],
  "Börek": ["yufka", "iç harcı", "fırın", "peynir", "kat kat", "yağ", "kol", "sigara böreği"],
  "Köfte": ["kıyma", "soğan", "baharat", "yuvarlak", "ızgara", "tavada", "şekillendirilmiş"],
  "Tavuk": ["kanat", "pilic", "kızartma", "ızgara", "beyaz et", "fırın", "baget", "göğüs"],
  "Balık": ["su", "kılçık", "ızgara", "taze", "deniz", "pişirme", "yüzgeç", "solungaç"],

  // Meslekler
  "Doktor": ["hastane", "iğne", "reçete", "muayene", "steteskop", "beyaz önlük", "ilaç", "teşhis"],
  "Öğretmen": ["okul", "ders", "öğrenci", "tahta", "not verme", "sınıf", "kalem", "kitap", "bilgi"],
  "Mühendis": ["çizim", "hesaplama", "proje", "tasarım", "teknik", "inşaat", "elektronik", "yazılım"],
  "Aşçı": ["mutfak", "pişirme", "tencere", "tava", "bıçak", "tarif", "lezzet", "fırın", "malzeme"],
  "Avukat": ["mahkeme", "dava", "savunma", "kanun", "belge", "hukuk", "savcı", "kadife cüppe"],
  "Polis": ["karakol", "araç", "yaka kartı", "el feneri", "ihbar", "gözaltı", "devriye", "silah"],
  "Asker": ["üniforma", "silah", "kışla", "emir", "terhis", "yurt savunma", "savaş", "kamuflaj"],
  "Pilot": ["kokpit", "uçuş", "kabin", "iniş", "coğrafya", "pilotaj", "kanatlar", "uçak", "kulaklık"],
  "Şoför": ["direksiyon", "araç kullanma", "yol", "trafik", "ehliyet", "koltuk", "araç"],
  "Hemşire": ["sargı", "iğne yapma", "hastane", "hasta bakımı", "önlük", "stetheskop", "randevu"],
  "Mimar": ["çizim", "bina", "plan", "yapı", "tasarım", "iskele", "köprü", "proje"],
  "Sanatçı": ["boya", "fırça", "tuval", "sergi", "çizim", "renk", "atölye", "eser", "hayal"],

  // Şehirler
  "İstanbul": ["boğaz", "köprü", "camii", "Avrupa Asya", "sahil", "nüfus", "Galata", "Kapalıçarşı"],
  "Ankara": ["başkent", "meclis", "Atatürk", "Kızılay", "devlet", "valilik", "yüksek irtifa"],
  "İzmir": ["Ege", "körfez", "saat kulesi", "deniz", "narçiçeği", "güneş", "kemeraltı"],
  "Antalya": ["deniz", "kumsal", "turizm", "kaleler", "yat limanı", "güneş", "tatil", "portakal"],
  "Bursa": ["yeşil", "kayak", "Uludağ", "tekstil", "etli ekmek", "tarihli", "cami"],
  "Trabzon": ["Karadeniz", "hamsi", "çay", "Ayasofya", "Sümela", "fındık", "hava"],
  "Gaziantep": ["baklavas", "pistachio", "yemek", "lezzet", "kale", "mutfak kültürü"],
  "Kapadokya": ["peri bacası", "sıcak hava balonu", "kaya evleri", "tüf", "Nevşehir", "üzüm"],
  "Pamukkale": ["travertenler", "sıcak su", "beyaz kireç", "termal", "havuzlar", "antik şehir"],
  "Rize": ["çay bahçesi", "Karadeniz", "yeşil", "yağmur", "dağlık", "çay hasadı"],

  // Eşyalar
  "Bilgisayar": ["klavye", "mouse", "ekran", "yazılım", "işlemci", "RAM", "fare tıklama", "kod"],
  "Telefon": ["ekran", "batarya", "SIM", "arama", "uygulama", "selfie", "dokunmatik"],
  "Televizyon": ["kanal", "uzaktan kumanda", "ekran", "yayın", "izleme", "anten", "satelit"],
  "Buzdolabı": ["soğutma", "dondurucu", "raf", "kapı", "gıda saklama", "motor", "kompresör"],
  "Saat": ["zaman", "akrep", "yelkovan", "pil", "kol", "çalar", "saniye"],
  "Gözlük": ["cam", "çerçeve", "lensler", "görme", "optik", "numaralı", "güneş"],
  "Çanta": ["fermuar", "sırt", "el", "içi", "deri", "omuz askısı", "bölme"],
  "Anahtar": ["kilit", "çelik", "kapı açma", "halka", "otomobil", "anahtarlık"],
  "Kalem": ["mürekkep", "yazma", "uç", "tükenmez", "kurşun", "kağıt", "boyama"],
  "Kitap": ["sayfa", "kapak", "okuma", "cilt", "kütüphane", "roman", "bilgi", "baskı"],
  "Lamba": ["ampul", "ışık", "aydınlatma", "tel", "gece ışığı", "abajur"],
  "Ayna": ["cam", "yansıma", "bakma", "güzellik", "çerçeve", "gümüş kaplama"],

  // Spor
  "Futbol": ["top", "kale", "faul", "golcü", "saha", "hakem", "penaltı", "ayak"],
  "Basketbol": ["pota", "ring", "üç sayı", "dribbling", "çift adım", "park", "takım"],
  "Voleybol": ["file", "smash", "blok", "servis", "top", "sahası", "rakip"],
  "Tenis": ["raket", "top", "kort", "servis", "ace", "Wimbledon", "karşı taraf"],
  "Yüzme": ["havuz", "yüzgeç", "serbest stil", "kelebek", "kulakçık", "deniz", "hız"],
  "Koşu": ["ayakkabı", "antrenman", "soluk", "mesafe", "maraton", "sprint", "pist"],
  "Binicilik": ["at", "eyer", "kamçı", "engel", "galop", "yarış", "ahır"],
  "Boks": ["eldivenler", "ring", "yumruk", "nakavt", "hakem", "round", "boks kulübü"],
  "Golf": ["sopa", "top", "delik", "çim", "saha", "golf arabası", "birlik"],
  
  // Meyveler
  "Elma": ["kırmızı", "yeşil", "sapı", "çekirdek", "meyve suyu", "elma şekeri", "bahçe"],
  "Portakal": ["turuncu", "kabuğu", "dilimler", "vitamin C", "bahçe", "taze sıkılmış"],
  "Muz": ["sarı", "kabuk", "tropikal", "uzun", "maymun", "nişasta", "olgunlaşma"],
  "Üzüm": ["salkım", "şarap", "çekirdek", "kuru", "asma", "morlu", "yeşil"],
  "Karpuz": ["yeşil dış", "kırmızı iç", "çekirdek", "serin", "yaz meyvesi", "büyük"],
  "Kavun": ["sarı", "tatlı koku", "çekirdek", "dilimler", "yaz", "olgunlaşma"],
  "Çilek": ["kırmızı", "küçük", "tatlı", "tohumlar", "pasta", "reçel", "bahçe"],
  "Kiraz": ["sap", "çift meyve", "siyah kırmızı", "ağaç", "tatlı ekşi"],
  "Şeftali": ["tüylü kabuk", "çekirdek", "sarı turuncu", "yumuşak", "meyve suyu"],
  "Armut": ["şekli", "yeşil sarı", "sap", "ince kabuk", "öz", "meyve"],

  // İçecekler
  "Su": ["şeffaf", "temiz", "yaşam", "bardak", "kaynak", "musluk", "h2o"],
  "Kahve": ["çekirdek", "siyah", "kafein", "kahvehane", "pişirme", "fincan", "türk", "espresso"],
  "Çay": ["demleme", "bardak", "sıcak", "bitki", "demlik", "şeker", "bergamot", "nar"],
  "Kola": ["karamel renk", "gazlı", "şekerli", "kutu", "balonlu", "yemek yanı"],
  "Limonata": ["limon", "şeker", "su", "taze", "serin", "ekşi", "ev yapımı"],
  "Süt": ["beyaz", "inek", "protein", "kalsiyum", "bardak", "kaymak", "kahvaltı"],
  "Bira": ["köpük", "malt", "şişe", "humala", "bar", "sarı", "soğuk servis"],
  "Şarap": ["üzüm", "kırmızı beyaz", "şişe", "mahzen", "kadeh", "fermentasyon"],
  "Ayran": ["yoğurt", "beyaz", "tuzlu", "soğuk", "köpüklü", "kebap yanı"],
  "Soda": ["gazlı", "şeffaf", "faydalı", "bardak", "balonlu"],

  // Kıyafetler
  "Tişört": ["kısa kollu", "yuvarlak yaka", "pamuklu", "renk", "baskılı", "günlük"],
  "Pantolon": ["iki paça", "bel", "cep", "kumaş", "kot", "dar geniş"],
  "Gömlek": ["yaka", "düğmeli", "uzun kollu", "resmi", "ofis", "ütü"],
  "Elbise": ["tek parça", "fermuar", "kadın", "etek ucu", "omuz açıklığı"],
  "Etek": ["bel lastiği", "etek ucu", "kısa uzun", "pileli", "kadın"],
  "Kazak": ["örgü", "yün", "kışlık", "kol", "yüksek yaka", "sıcak"],
  "Ceket": ["yaka", "cep", "düğme", "kol", "resmi", "takım elbise"],
  "Mont": ["fermuarlı", "kapüşon", "kışlık", "astar", "su geçirmez", "dolgu"],
  "Şapka": ["kep", "siperlik", "güneşten korunma", "takma", "baş"],
  "Ayakkabı": ["taban", "bağcık", "numara", "deri", "spor", "yüksek topuk"],

  // Ulaşım
  "Araba": ["tekerlek", "motor", "direksiyon", "benzin", "vitesse", "egzost", "plaka"],
  "Otobüs": ["kalabalık", "durak", "bilet", "sürücü", "uzun", "kent içi"],
  "Tren": ["ray", "vagon", "gar", "bilet", "lokomotif", "tünel", "istasyon"],
  "Uçak": ["kanatlar", "pilot", "kalkış", "iniş", "yolcu", "türbin", "bulut"],
  "Gemi": ["dalgalar", "liman", "deniz", "güverte", "kaptan", "yelken"],
  "Motorsiklet": ["iki tekerlek", "egzost sesi", "kask", "hız", "motor sesi"],
  "Bisiklet": ["pedal", "zincir", "gidon", "iki tekerlek", "kaldırım", "sürmek"],
  "Taksi": ["sarı", "şoför", "metre", "yolcu", "durak", "çağırma"],
  "Helikopter": ["pervane", "hava taşıtı", "dikey iniş", "rotor", "kurtarma"],

  // Doğa
  "Dağ": ["zirve", "kayalık", "tırmanma", "kar", "sis", "yüksek", "tepe", "yayla"],
  "Deniz": ["tuzlu su", "dalgalar", "kumsal", "derinlik", "mavi", "balık", "ufuk"],
  "Göl": ["sakin su", "kıyı", "yansıma", "tekne", "tatlı su", "ördek"],
  "Nehir": ["akış", "köprü", "kıyı", "iki taraf", "kayık", "balık tutma"],
  "Orman": ["ağaçlar", "gölge", "hayvanlar", "yeşil", "yabani", "kuşlar", "sessizlik"],
  "Çöl": ["kum", "deve", "sıcak", "susuzluk", "kaktüs", "fırtına", "ay ışığı"],
  "Çiçek": ["taç yaprak", "koku", "renk", "saksı", "bahçe", "arı", "tohum"],
  "Ağaç": ["dal", "yaprak", "gövde", "kök", "meyve", "gölge", "yıllık halka"],
  "Taş": ["sert", "kaya", "mineral", "ağır", "doğal", "yapı malzemesi"],
  "Bulut": ["beyaz", "gökyüzü", "yağmur", "yüzer", "şekil değiştirir", "sis"],

  // Teknoloji
  "Laptop": ["klavye", "ekran", "şarj", "taşınabilir", "kapak", "USB", "akü"],
  "Tablet": ["dokunmatik", "büyük ekran", "kalem", "uygulama", "ince", "wifi"],
  "Kamera": ["lens", "fotoğraf", "vizör", "ışık", "çekim", "flaş", "dijital"],
  "Kulaklık": ["ses", "kablo", "mikrofon", "müzik", "kulak", "kablosuz", "gürültü"],
  "Konsol": ["oyun", "joystick", "ekran bağlantısı", "çok oyunculu", "kartuş"],
  "Drone": ["pervane", "kamera", "uzaktan", "uçma", "batarya", "video"],
  "Robot": ["mekanik", "yapay zeka", "hareket", "otomasyon", "devre", "metalik"],
  "Akıllı Saat": ["bilek", "bildirim", "spor takip", "dokunmatik ekran", "şarj"],
  "Yazıcı": ["mürekkep", "kağıt", "yazdırma", "tarama", "baskı", "toner"],
  "Projeksiyon": ["ışık", "ekran", "koyu oda", "sunum", "yansıtma", "film gösterimi"],

  // Müzik
  "Gitar": ["tel", "akor", "pena", "sapı", "akustik elektrik", "çalmak", "sol anahtar"],
  "Piyano": ["tuş", "notalar", "sol pedal", "siyah beyaz", "büyük enstrüman", "kafes"],
  "Davul": ["zil", "davul derisi", "stick", "ritim", "vurma", "bas davul"],
  "Keman": ["yay", "tel", "reçine", "sol anahtar", "titreme", "orkestra"],
  "Ney": ["kamış", "üfleme", "mistik", "Mevlevi", "delikler", "derin ses"],
  "Bağlama": ["mızrap", "teller", "sap", "tekne", "türkü", "halk müziği"],
  "Saksafon": ["ağızlık", "bakır", "caz", "nefesli", "vals", "metal gövde"],
  "Mikrofon": ["ses alma", "şarkı söyleme", "kablo", "konuşma", "el tipi", "masa tipi"],
  "Hoparlör": ["titreşim", "ses çıkaran", "kablosuz", "stereo", "güç", "frekans"],
  "Amfi": ["güç", "elektrik gitar", "ses yükseltme", "hoparlör", "watt", "kabinet"],

  // Vücut
  "Göz": ["bakış", "retina", "iris", "görme", "kirpik", "kaş", "göz bebeği", "mercek"],
  "Kulak": ["işitme", "kulak zarı", "kıkırdak", "ses algılama", "iç kulak"],
  "Burun": ["koku alma", "nefes", "burun deliği", "hassas", "sinüs", "önde"],
  "Ağız": ["dil", "diş", "dudaklar", "konuşma", "yemek", "lezzet", "şarkı"],
  "El": ["parmaklar", "avuç", "bilek", "tutma", "dokunma", "yazma"],
  "Ayak": ["parmaklar", "topuk", "taban", "yürüme", "koşma", "ayak bileği"],
  "Beyin": ["düşünce", "nöron", "hafıza", "sinyal", "kafa", "akıl", "bilinç"],
  "Kalp": ["atış", "kan pompası", "kasılma", "ritim", "damar", "kalp krizi"],
  "Dil": ["tat", "yemek", "konuşma", "hareket", "tükürük", "tatlar"],
  "Diş": ["diş fırçası", "mine", "çiğneme", "diş hekimi", "beyazlık", "kole"],
};

// Sahtekarın kelimeye benzer ipuçları - kelimeden çıkarılabilecek yanlış detaylar
const IMPOSTOR_FAKE_HINTS: Record<string, string[]> = {
  "Araba": ["dört ayak", "su içiyor", "çiğniyor", "uçabilir", "balık tutar"],
  "Uçak": ["tekerlekli", "yerde gider", "sürücü var", "yakıtsız", "dalgalar"],
  "Futbol": ["elle tutulur", "sahadaki top büyük", "yüzme sporü", "3 takım"],
  "Gitar": ["nefesli", "vurmalı", "ayakla çalınır", "sualtında"],
  "Aslan": ["tüysüz", "ot yer", "su altında", "uçar"],
  "Pizza": ["soğuk yenir", "limonlu", "çorba gibi", "hamurun içi boş"],
};

function getWordHints(word: string): string[] {
  // Normalleştirme
  const normalizedWord = word.trim();
  
  // Direkt eşleşme
  if (WORD_HINTS[normalizedWord]) {
    return WORD_HINTS[normalizedWord];
  }
  
  // Büyük/küçük harf farkıyla arama
  const lowerWord = normalizedWord.toLowerCase();
  for (const [key, hints] of Object.entries(WORD_HINTS)) {
    if (key.toLowerCase() === lowerWord) {
      return hints;
    }
  }
  
  // Kelimeye benzer ipuçları bulamazsak genel ipuçları
  return generateGenericHints(normalizedWord);
}

function generateGenericHints(word: string): string[] {
  const firstLetter = word.charAt(0).toUpperCase();
  const length = word.length;
  
  return [
    `${firstLetter} harfi ile başlar`,
    `${length} harfli`,
    `Bilinen bir şey`,
    `Herkes bilir`,
    `Günlük hayatta kullanılan`,
    `${firstLetter}... diye başlar`,
    `Yaygın bir kavram`,
    `Türkçe kelime`,
  ];
}

export function analyzePlayerSuspicion(
  players: Player[], 
  messages: Message[], 
  currentWord: string
): Map<string, number> {
  const suspicionScores = new Map<string, number>();
  
  const playerMessages = new Map<string, string[]>();
  messages.filter(m => !m.isSystem).forEach(m => {
    if (m.playerId) {
      const existing = playerMessages.get(m.playerId) || [];
      existing.push(m.text);
      playerMessages.set(m.playerId, existing);
    }
  });

  players.forEach(player => {
    if (player.role === 'impostor') {
      suspicionScores.set(player.id, 0.3);
      return;
    }

    const msgs = playerMessages.get(player.id) || [];
    let score = 0.1;

    if (msgs.length === 0) {
      score += 0.3;
    }

    const shortMessages = msgs.filter(m => m.length < 4).length;
    if (shortMessages > msgs.length * 0.5) {
      score += 0.2;
    }

    const wordHints = getWordHints(currentWord);
    msgs.forEach(msg => {
      const msgLower = msg.toLowerCase();
      const hasRelatedHint = wordHints.some(hint => 
        msgLower.includes(hint.toLowerCase()) || hint.toLowerCase().includes(msgLower)
      );
      if (!hasRelatedHint && msg.length > 3) {
        score += 0.1;
      }
    });

    suspicionScores.set(player.id, Math.min(score, 1));
  });

  return suspicionScores;
}

export function getSmartBotVote(
  botPlayer: Player,
  players: Player[],
  messages: Message[],
  currentWord: string
): string {
  const suspicionScores = analyzePlayerSuspicion(players, messages, currentWord);
  
  const eligibleTargets = players.filter(p => p.id !== botPlayer.id);
  
  if (botPlayer.role === 'impostor') {
    // Sahtekar bot: En az şüpheli oyuncuya oy ver ama biraz rastgelelik ekle
    const sortedByTrust = [...eligibleTargets].sort((a, b) => {
      const aScore = suspicionScores.get(a.id) || 0;
      const bScore = suspicionScores.get(b.id) || 0;
      return aScore - bScore;
    });
    
    // %30 ihtimalle en az şüpheliye, yoksa en güvenli 3'ten birine
    if (Math.random() < 0.3 && sortedByTrust.length > 0) {
      return sortedByTrust[0].id;
    }
    
    const safeTargets = sortedByTrust.slice(0, Math.min(3, sortedByTrust.length));
    return safeTargets[Math.floor(Math.random() * safeTargets.length)]?.id || eligibleTargets[0].id;
  }

  // Vatandaş bot: En şüpheli oyuncuya oy ver ama her zaman mükemmel olmasın
  const sortedBySuspicion = [...eligibleTargets].sort((a, b) => {
    const aScore = suspicionScores.get(a.id) || 0;
    const bScore = suspicionScores.get(b.id) || 0;
    return bScore - aScore;
  });

  // Yüksek şüphe skoru varsa (%50 ihtimalle ona oy ver)
  const topSuspicious = sortedBySuspicion[0];
  if (topSuspicious && (suspicionScores.get(topSuspicious.id) || 0) > 0.3) {
    if (Math.random() < 0.5) {
      return topSuspicious.id;
    }
  }

  // En şüpheli 3 oyuncudan birine oy ver (ağırlıklı olarak en şüpheliye)
  const topSuspicious3 = sortedBySuspicion.slice(0, Math.min(3, sortedBySuspicion.length));
  
  // Ağırlıklı rastgele: index 0 daha yüksek ihtimal
  const weights = [0.6, 0.3, 0.1];
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < topSuspicious3.length; i++) {
    cumulative += weights[i] || 0;
    if (rand <= cumulative) {
      return topSuspicious3[i].id;
    }
  }
  
  return topSuspicious3[0]?.id || eligibleTargets[0].id;
}

export function getSmartBotHint(botPlayer: Player, players: Player[], word: string): string {
  if (botPlayer.role === 'impostor') {
    // Sahtekar bot: kelimeyle ilgisiz ama akıllıca görünen ipuçları
    const rand = Math.random();
    
    // %40 ihtimalle sahte ama makul görünen ipucu
    if (rand < 0.4) {
      const fakeHints = IMPOSTOR_FAKE_HINTS[word];
      if (fakeHints && fakeHints.length > 0) {
        return fakeHints[Math.floor(Math.random() * fakeHints.length)];
      }
    }
    
    // %30 ihtimalle kelime meta-bilgisi (harf, uzunluk)
    if (rand < 0.7) {
      const firstLetter = word.charAt(0).toUpperCase();
      const length = word.length;
      const metaHints = [
        `${firstLetter} harfi ile başlıyor`,
        `${length} harfli bir kelime`,
        `Sonunda ${word.charAt(word.length-1)} var`,
        `${firstLetter}... ${length} harf`,
      ];
      return metaHints[Math.floor(Math.random() * metaHints.length)];
    }
    
    // %30 ihtimalle şüpheli vague yanıt
    const vagueHints = [
      'Hmm... biliyorum sanırım',
      'Aklıma geliyor ama...',
      'Benzer bir şey gördüm',
      'Çok yakın ama tam değil',
      'Vallahi emin değilim',
      'Bir şeyler hatırlıyorum',
    ];
    return vagueHints[Math.floor(Math.random() * vagueHints.length)];
  }
  
  // Vatandaş bot: kelimeyle ilgili gerçek ipuçları
  const wordHints = getWordHints(word);
  
  // Her botun farklı bir ipucu seçmesi için random
  const randomIndex = Math.floor(Math.random() * wordHints.length);
  return wordHints[randomIndex];
}

export function getRandomBotDelay(): number {
  return 100 + Math.random() * 200;
}

export function getRandomVotingDelay(): number {
  return 100 + Math.random() * 300;
}
