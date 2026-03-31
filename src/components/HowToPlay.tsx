import { motion } from 'motion/react';
import { X, Users, Crown, Skull, MessageCircle, Trophy } from 'lucide-react';

const GAME_RULES = [
  { icon: Users, title: "3+ Oyuncu", description: "En az 3 kişi ile oynanır" },
  { icon: Crown, title: "Rol Dağılımı", description: "Bir kişi Sahtekar, diğerleri Vatandaş" },
  { icon: Skull, title: "Sahtekar Kim?", description: "Sahtekar kelimeyi bilmez, ipucu çalar" },
  { icon: MessageCircle, title: "İpucu Ver", description: "Sırayla kelime ile ilgili ipuçları verin" },
  { icon: Trophy, title: "Oylama", description: "Sahtekarı bulmaya çalışın" },
];

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-[2rem] p-6 max-h-[85dvh] overflow-y-auto shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-zinc-900">Nasıl Oynanır?</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        <div className="space-y-4">
          {GAME_RULES.map((rule, index) => (
            <motion.div 
              key={rule.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-zinc-50 rounded-2xl"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <rule.icon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{rule.title}</h3>
                <p className="text-sm text-zinc-500">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
          <h3 className="font-bold text-red-600 mb-2">Kazanma Koşulları</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Vatandaşlar: Sahtekarı bulursanız kazanırsınız</li>
            <li>• Sahtekar: Kelimeyi doğru tahmin ederseniz kazanırsınız</li>
          </ul>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 active:scale-95 transition-all"
        >
          Anladım, Başlayalım!
        </button>
      </motion.div>
    </motion.div>
  );
}
