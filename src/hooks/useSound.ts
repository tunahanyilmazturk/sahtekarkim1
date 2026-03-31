import { useCallback, useRef, useState, useEffect } from 'react';

type SoundType = 
  | 'buttonClick'
  | 'messageSend'
  | 'gameStart'
  | 'roleReveal'
  | 'vote'
  | 'correctGuess'
  | 'wrongGuess'
  | 'impostorWin'
  | 'citizenWin'
  | 'playerJoin'
  | 'playerLeave';

interface SoundConfig {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  buttonClick: { frequency: 800, duration: 0.1, volume: 0.1, type: 'sine' },
  messageSend: { frequency: 600, duration: 0.15, volume: 0.1, type: 'sine' },
  gameStart: { frequency: 523, duration: 0.3, volume: 0.15, type: 'sine' },
  roleReveal: { frequency: 784, duration: 0.5, volume: 0.2, type: 'sine' },
  vote: { frequency: 440, duration: 0.2, volume: 0.1, type: 'triangle' },
  correctGuess: { frequency: 880, duration: 0.4, volume: 0.2, type: 'sine' },
  wrongGuess: { frequency: 220, duration: 0.4, volume: 0.2, type: 'sawtooth' },
  impostorWin: { frequency: 392, duration: 0.6, volume: 0.2, type: 'sine' },
  citizenWin: { frequency: 659, duration: 0.6, volume: 0.2, type: 'sine' },
  playerJoin: { frequency: 700, duration: 0.2, volume: 0.1, type: 'sine' },
  playerLeave: { frequency: 300, duration: 0.3, volume: 0.1, type: 'sine' },
};

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
    };

    const handleInteraction = () => {
      initAudio();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!enabled || !audioContextRef.current) return;

    try {
      const config = SOUND_CONFIGS[type];
      const ctx = audioContextRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = config.type || 'sine';
      oscillator.frequency.setValueAtTime(config.frequency || 440, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(config.volume || 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (config.duration || 0.2));

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + (config.duration || 0.2));
    } catch (e) {
      console.log('Sound error:', e);
    }
  }, [enabled]);

  const toggleSound = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);

  return { playSound, enabled, toggleSound };
}
