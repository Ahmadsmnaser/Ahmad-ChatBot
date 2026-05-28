import type { Language } from '@/lib/i18n';

export type BotEmotion =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'wink'
  | 'thinking'
  | 'listening'
  | 'confused'
  | 'laughing'
  | 'sleepy'
  | 'surprised';

export interface FaceConfig {
  mouth: string;
  mouthFill: string;
  /** 'normal' | 'wink' (left eye arc) | 'xeyes' (>< chevrons) */
  eyeShape: 'normal' | 'wink' | 'xeyes';
  /** CSS scaleY for eyes — blink overrides to 0.08 */
  eyeScaleY: number;
  /** ry of eye ellipses */
  eyeRY: number;
  leftBrowLift: number;
  rightBrowLift: number;
  cheekOpacity: number;
  antennaRotate: boolean;
  sparkles: boolean;
}

export const FACE_CONFIGS: Record<BotEmotion, FaceConfig> = {
  idle: {
    mouth: 'M26 42 Q32 46 38 42',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 1,
    eyeRY: 4.7,
    leftBrowLift: 0,
    rightBrowLift: 0,
    cheekOpacity: 0.7,
    antennaRotate: false,
    sparkles: false,
  },
  happy: {
    mouth: 'M25 42 Q32 47.5 39 42',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 0.82,
    eyeRY: 4.7,
    leftBrowLift: 0,
    rightBrowLift: 0,
    cheekOpacity: 0.9,
    antennaRotate: false,
    sparkles: false,
  },
  excited: {
    mouth: 'M24 41 Q32 49 40 41 Q32 45 24 41 Z',
    mouthFill: '#2D2438',
    eyeShape: 'normal',
    eyeScaleY: 1,
    eyeRY: 4.7,
    leftBrowLift: -2,
    rightBrowLift: -2,
    cheekOpacity: 1,
    antennaRotate: true,
    sparkles: true,
  },
  curious: {
    mouth: 'M30 42 Q32 44.5 34 42',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 1,
    eyeRY: 4.7,
    leftBrowLift: -3,
    rightBrowLift: -1,
    cheekOpacity: 0.7,
    antennaRotate: false,
    sparkles: false,
  },
  wink: {
    mouth: 'M26 42 Q32 46 38 42',
    mouthFill: 'none',
    eyeShape: 'wink',
    eyeScaleY: 1,
    eyeRY: 4.7,
    leftBrowLift: 0,
    rightBrowLift: -1,
    cheekOpacity: 0.75,
    antennaRotate: false,
    sparkles: false,
  },
  thinking: {
    mouth: 'M27 43 Q30 44.5 36 43',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 0.68,
    eyeRY: 4.7,
    leftBrowLift: -3,
    rightBrowLift: 0,
    cheekOpacity: 0.5,
    antennaRotate: false,
    sparkles: false,
  },
  listening: {
    mouth: 'M27 42 Q32 45.5 37 42',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 1.1,
    eyeRY: 5.2,
    leftBrowLift: -1,
    rightBrowLift: -1,
    cheekOpacity: 0.8,
    antennaRotate: false,
    sparkles: false,
  },
  confused: {
    mouth: 'M26 43 Q29 46 32 43 Q35 40 38 42',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 1,
    eyeRY: 4.7,
    leftBrowLift: -2,
    rightBrowLift: 2,
    cheekOpacity: 0.5,
    antennaRotate: false,
    sparkles: false,
  },
  laughing: {
    mouth: 'M24 40 Q32 50 40 40 Q32 46 24 40 Z',
    mouthFill: '#2D2438',
    eyeShape: 'xeyes',
    eyeScaleY: 1,
    eyeRY: 4.7,
    leftBrowLift: -2,
    rightBrowLift: -2,
    cheekOpacity: 1,
    antennaRotate: true,
    sparkles: true,
  },
  sleepy: {
    mouth: 'M29 43 Q32 45 35 43',
    mouthFill: 'none',
    eyeShape: 'normal',
    eyeScaleY: 0.28,
    eyeRY: 4.7,
    leftBrowLift: 1,
    rightBrowLift: 1,
    cheekOpacity: 0.5,
    antennaRotate: false,
    sparkles: false,
  },
  surprised: {
    mouth: 'M30 41 Q27 45 30 48 Q32 50 34 48 Q37 45 34 41 Q32 39 30 41 Z',
    mouthFill: '#2D2438',
    eyeShape: 'normal',
    eyeScaleY: 1.3,
    eyeRY: 5.8,
    leftBrowLift: -5,
    rightBrowLift: -5,
    cheekOpacity: 0.9,
    antennaRotate: false,
    sparkles: false,
  },
};

export const BUBBLE_MESSAGES: Record<Language, Record<string, string[]>> = {
  en: {
    greeting: ["Ahmad's Chat 😎", 'Hi there! 👋', "Let's start!", 'Ready when you are!'],
    idle:     ['Ready to help 😄', 'Ask me anything', "What are we building today?", 'Tiny bot, big brain 🧠'],
    thinking: ['Thinking...', 'Hmm, let me think 🤔', 'On it!', 'One sec...'],
    listening:["I'm listening 👀", 'Got it!', 'Tell me more', "I'm all ears 👂"],
    happy:    ['Great! 😊', 'Done! ✨', 'Here you go!', 'Nailed it! 🎯'],
    excited:  ["Let's go! 🚀", 'Yay!', 'This is fun! 🎉', 'So exciting!'],
    confused: ['Hmm... 🤔', 'Let me try again', 'Oops!'],
    sleepy:   ['Zzzz... 😴', '*yawns*', 'So sleepy...'],
    click:    ['Hehe 😄', 'You clicked me!', 'Boop! 👉', 'Hello!', 'Hey! 😄'],
  },
  ar: {
    greeting: ['هاي دردشة أحمد 😎', 'أهلاً! 👋', 'خلينا نبدأ!', 'جاهز لما تكون جاهز!'],
    idle:     ['جاهز أساعدك 😄', 'اسألني أي شيء', 'شو بدك ننجز اليوم؟', 'هاي دردشة أحمد 😎'],
    thinking: ['أفكر شوي...', 'همم... 🤔', 'بشتغل!', 'لحظة...'],
    listening:['أنا مركز معك 👀', 'فهمت!', 'قول لي أكثر', 'أنا كلي آذان 👂'],
    happy:    ['ممتاز! 😊', 'خلصنا! ✨', 'تفضل!', 'أصبنا! 🎯'],
    excited:  ['يلا نبدأ! 🚀', 'ياي!', 'هذا ممتع! 🎉', 'رائع!'],
    confused: ['همم... 🤔', 'خلينا نحاول مرة ثانية', 'أوبس!'],
    sleepy:   ['zzz... 😴', '*تثاؤب*', 'أنا نعسان...'],
    click:    ['ههههه 😄', 'وقفت علي!', 'بوب! 👉', 'مرحبا!', 'هاي! 😄'],
  },
};

export const IDLE_EMOTION_SEQUENCE: BotEmotion[] = [
  'happy', 'curious', 'happy', 'wink', 'excited', 'happy',
];
export const CLICK_EMOTIONS: BotEmotion[] = ['excited', 'laughing', 'surprised', 'wink'];
export const PERSONALITY_EMOTIONS: BotEmotion[] = ['laughing', 'surprised', 'curious'];

export const IDLE_INTERVAL_MS    = 4200;
export const BUBBLE_DISPLAY_MS   = 3600;
export const BUBBLE_COOLDOWN_MS  = 9000;
export const IDLE_THRESHOLD_MS   = 2500;
export const SLEEPY_THRESHOLD_MS = 28000;
export const CLICK_CLEAR_MS      = 1600;
