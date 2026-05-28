'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '@/lib/i18n';
import {
  BotEmotion,
  FACE_CONFIGS,
  BUBBLE_MESSAGES,
  IDLE_EMOTION_SEQUENCE,
  CLICK_EMOTIONS,
  PERSONALITY_EMOTIONS,
  IDLE_INTERVAL_MS,
  BUBBLE_DISPLAY_MS,
  BUBBLE_COOLDOWN_MS,
  IDLE_THRESHOLD_MS,
  SLEEPY_THRESHOLD_MS,
  CLICK_CLEAR_MS,
} from './mascotConfig';

// ─── Small inline mascot (sidebar / loading screen) ─────────────────────────

export function Mascot({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="mascotBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B8A4E3" />
          <stop offset="1" stopColor="#9B87D9" />
        </linearGradient>
        <linearGradient id="mascotShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="32" y1="6" x2="32" y2="12" stroke="#9B87D9" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="5" r="3" fill="#F4C2D7" />
      <rect x="10" y="12" width="44" height="40" rx="14" fill="url(#mascotBody)" />
      <rect x="10" y="12" width="44" height="24" rx="14" fill="url(#mascotShine)" />
      <circle cx="18" cy="38" r="3" fill="#F4C2D7" opacity="0.85" />
      <circle cx="46" cy="38" r="3" fill="#F4C2D7" opacity="0.85" />
      <ellipse cx="24" cy="30" rx="3.5" ry="4.5" fill="#2D2438" />
      <ellipse cx="40" cy="30" rx="3.5" ry="4.5" fill="#2D2438" />
      <circle cx="25" cy="28.5" r="1.2" fill="#fff" />
      <circle cx="41" cy="28.5" r="1.2" fill="#fff" />
      <path d="M26 42 Q32 46 38 42" stroke="#2D2438" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="6" y="28" width="4" height="10" rx="2" fill="#9B87D9" />
      <rect x="54" y="28" width="4" height="10" rx="2" fill="#9B87D9" />
    </svg>
  );
}

// ─── Large interactive mascot (empty state) ──────────────────────────────────

export interface MascotLargeProps {
  lang?: Language;
  isTyping?: boolean;
  isThinking?: boolean;
  isStreaming?: boolean;
  hasError?: boolean;
}

export function MascotLarge({
  lang = 'en',
  isTyping = false,
  isThinking = false,
  isStreaming = false,
  hasError = false,
}: MascotLargeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const [eye, setEye]               = useState({ x: 0, y: 0 });
  const [tilt, setTilt]             = useState({ x: 0, y: 0 });
  const [blinking, setBlinking]     = useState(false);
  const [idleEmotion, setIdleEmotion] = useState<BotEmotion>('happy');
  const [clickEmotion, setClickEmotion] = useState<BotEmotion | null>(null);
  const [hover, setHover]           = useState(false);
  const [isSleepy, setIsSleepy]     = useState(false);
  const [bubble, setBubble]         = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [prefersReduced, setPrefersReduced] = useState(false);

  const lastMoveRef        = useRef(Date.now());
  const lastInteractionRef = useRef(Date.now());
  const bubbleTimerRef     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const bubbleCooldownRef  = useRef(0);
  const clickTimerRef      = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const greetedRef         = useRef(false);

  // Detect reduced-motion preference once on client
  useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // ── Resolve displayed emotion (priority chain) ───────────────────────────
  const resolvedEmotion: BotEmotion = (() => {
    if (hasError)                    return 'confused';
    if (isThinking)                  return 'thinking';
    if (isStreaming || isTyping)     return 'listening';
    if (clickEmotion)                return clickEmotion;
    if (hover)                       return 'happy';
    if (isSleepy)                    return 'sleepy';
    return idleEmotion;
  })();

  const face      = FACE_CONFIGS[resolvedEmotion];
  // Suppress blink for x-eyes (would look wrong when scaleY-compressed)
  const showBlink = blinking && face.eyeShape !== 'xeyes';
  const eyeScale  = showBlink ? 0.08 : face.eyeScaleY;
  const isWink    = face.eyeShape === 'wink' && !showBlink;
  const isXEyes   = face.eyeShape === 'xeyes';

  // ── Show a speech bubble ─────────────────────────────────────────────────
  const showBubbleMessage = useCallback((category: string) => {
    const pool = BUBBLE_MESSAGES[lang]?.[category] ?? BUBBLE_MESSAGES.en[category] ?? [];
    if (!pool.length) return;
    const text = pool[Math.floor(Math.random() * pool.length)];
    setBubble({ text, visible: true });
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setBubble(b => ({ ...b, visible: false }));
      bubbleCooldownRef.current = Date.now();
    }, BUBBLE_DISPLAY_MS);
  }, [lang]);

  // ── Mouse follow ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onMove(e: MouseEvent) {
      lastMoveRef.current = Date.now();
      lastInteractionRef.current = Date.now();
      setIsSleepy(false);
      const el = wrapRef.current;
      if (!el) return;
      const r   = el.getBoundingClientRect();
      const cx  = r.left + r.width / 2;
      const cy  = r.top + r.height / 2;
      const dx  = e.clientX - cx;
      const dy  = e.clientY - cy;
      const k   = Math.min(1, Math.hypot(dx, dy) / 240);
      const ang = Math.atan2(dy, dx);
      setEye({ x: Math.cos(ang) * 2.6 * k, y: Math.sin(ang) * 2.4 * k });
      setTilt({ x: Math.cos(ang) * 6 * k,   y: Math.sin(ang) * 5 * k   });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Blink loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;
    let to: ReturnType<typeof setTimeout>;
    function loop() {
      to = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => {
          setBlinking(false);
          // 25% chance of double-blink
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlinking(true);
              setTimeout(() => setBlinking(false), 130);
            }, 180);
          }
          loop();
        }, 140);
      }, 2400 + Math.random() * 3800);
    }
    loop();
    return () => clearTimeout(to);
  }, [prefersReduced]);

  // ── Idle emotion sequence ────────────────────────────────────────────────
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % IDLE_EMOTION_SEQUENCE.length;
      setIdleEmotion(IDLE_EMOTION_SEQUENCE[i]);
    }, IDLE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  // ── Idle look-around ─────────────────────────────────────────────────────
  useEffect(() => {
    if (prefersReduced) return;
    const t = setInterval(() => {
      if (Date.now() - lastMoveRef.current > IDLE_THRESHOLD_MS) {
        const a = Math.random() * Math.PI * 2;
        setEye({ x: Math.cos(a) * 2, y: Math.sin(a) * 1.6 });
        setTilt({ x: Math.cos(a) * 4, y: Math.sin(a) * 3 });
      }
    }, 1800);
    return () => clearInterval(t);
  }, [prefersReduced]);

  // ── Sleepy detection + personality bubble moments ────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      const idle = Date.now() - lastInteractionRef.current;
      if (idle > SLEEPY_THRESHOLD_MS) {
        setIsSleepy(true);
        if (Date.now() - bubbleCooldownRef.current > BUBBLE_COOLDOWN_MS) {
          showBubbleMessage('sleepy');
        }
        return;
      }
      setIsSleepy(false);
      // Occasional personality flash: random emotion + bubble (not too frequent)
      if (
        idle > 6000 &&
        Date.now() - bubbleCooldownRef.current > BUBBLE_COOLDOWN_MS &&
        Math.random() < 0.12
      ) {
        const e = PERSONALITY_EMOTIONS[Math.floor(Math.random() * PERSONALITY_EMOTIONS.length)];
        setIdleEmotion(e);
        showBubbleMessage('idle');
      }
    }, 3000);
    return () => clearInterval(t);
  }, [showBubbleMessage]);

  // ── Greeting bubble on first mount ───────────────────────────────────────
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    const to = setTimeout(() => showBubbleMessage('greeting'), 900);
    return () => clearTimeout(to);
  }, [showBubbleMessage]);

  // ── React to external state: thinking ────────────────────────────────────
  const prevThinkingRef = useRef(false);
  useEffect(() => {
    if (isThinking && !prevThinkingRef.current) {
      showBubbleMessage('thinking');
    }
    prevThinkingRef.current = isThinking;
  }, [isThinking, showBubbleMessage]);

  // ── React to external state: typing ─────────────────────────────────────
  useEffect(() => {
    if (isTyping) {
      lastInteractionRef.current = Date.now();
      setIsSleepy(false);
    }
  }, [isTyping]);

  // ── Click handler ────────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    lastInteractionRef.current = Date.now();
    setIsSleepy(false);
    const e = CLICK_EMOTIONS[Math.floor(Math.random() * CLICK_EMOTIONS.length)];
    setClickEmotion(e);
    showBubbleMessage('click');
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => setClickEmotion(null), CLICK_CLEAR_MS);
  }, [showBubbleMessage]);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(bubbleTimerRef.current);
      clearTimeout(clickTimerRef.current);
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: 140,
        height: 140,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={handleClick}
    >
      {/* Speech bubble — absolutely positioned, does not affect layout */}
      <div
        className={`mascot-bubble${bubble.visible ? ' mascot-bubble--visible' : ''}`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        aria-hidden="true"
      >
        {bubble.text}
      </div>

      <svg
        width="140"
        height="140"
        viewBox="0 0 64 64"
        aria-hidden="true"
        style={{
          transform: `translate(${tilt.x * 0.15}px,${tilt.y * 0.15}px) rotate(${tilt.x * 0.4}deg)`,
          transition: 'transform 220ms cubic-bezier(.3,.7,.4,1)',
          filter: 'drop-shadow(0 8px 24px rgba(155,135,217,0.35))',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id="bigBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B8A4E3" />
            <stop offset="1" stopColor="#9B87D9" />
          </linearGradient>
          <linearGradient id="bigShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bigGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#B8A4E3" stopOpacity="0.5" />
            <stop offset="1" stopColor="#B8A4E3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow pulse */}
        <circle cx="32" cy="34" r="30" fill="url(#bigGlow)">
          {!prefersReduced && (
            <animate attributeName="r" values="30;33;30" dur="4s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Antenna */}
        <g
          style={{
            transformOrigin: '32px 12px',
            transform: face.antennaRotate || hover ? 'rotate(-6deg)' : 'rotate(0deg)',
            transition: 'transform 300ms',
          }}
        >
          <line x1="32" y1="6" x2="32" y2="12" stroke="#9B87D9" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="4.5" r="3" fill="#F4C2D7">
            {!prefersReduced && (
              <animate attributeName="r" values="3;3.5;3" dur="2.4s" repeatCount="indefinite" />
            )}
          </circle>
        </g>

        {/* Body */}
        <rect x="10" y="12" width="44" height="40" rx="14" fill="url(#bigBody)" />
        <rect x="10" y="12" width="44" height="24" rx="14" fill="url(#bigShine)" />
        <rect x="6"  y="28" width="4"  height="10" rx="2"  fill="#9B87D9" />
        <rect x="54" y="28" width="4"  height="10" rx="2"  fill="#9B87D9" />

        {/* Cheeks */}
        <circle cx="18" cy="38" r="3" fill="#F4C2D7" opacity={face.cheekOpacity} />
        <circle cx="46" cy="38" r="3" fill="#F4C2D7" opacity={face.cheekOpacity} />

        {/* Brows */}
        <line
          x1="19" y1={22 + face.leftBrowLift}
          x2="29" y2={23 + face.leftBrowLift}
          stroke="#9B87D9" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"
        />
        <line
          x1="35" y1={23 + face.rightBrowLift}
          x2="45" y2={22 + face.rightBrowLift}
          stroke="#9B87D9" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"
        />

        {/* Left eye */}
        <g
          style={{
            transform: `scaleY(${eyeScale})`,
            transformOrigin: '24px 30px',
            transition: 'transform 90ms ease',
          }}
        >
          {isWink ? (
            /* Wink arc replaces left eye ellipse */
            <path d="M20 30 Q24 27 28 30" stroke="#2D2438" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : isXEyes ? (
            /* > chevron (laughing) */
            <path d="M20 27 L28 30 L20 33" stroke="#2D2438" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <ellipse cx={24 + eye.x} cy={30 + eye.y} rx="3.7" ry={face.eyeRY} fill="#2D2438" />
              <circle  cx={25 + eye.x} cy={28.5 + eye.y} r="1.3" fill="#fff" />
            </>
          )}
        </g>

        {/* Right eye */}
        <g
          style={{
            transform: `scaleY(${eyeScale})`,
            transformOrigin: '40px 30px',
            transition: 'transform 90ms ease',
          }}
        >
          {isXEyes ? (
            /* < chevron (laughing) */
            <path d="M44 27 L36 30 L44 33" stroke="#2D2438" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <ellipse cx={40 + eye.x} cy={30 + eye.y} rx="3.7" ry={face.eyeRY} fill="#2D2438" />
              <circle  cx={41 + eye.x} cy={28.5 + eye.y} r="1.3" fill="#fff" />
            </>
          )}
        </g>

        {/* Mouth */}
        <path
          d={face.mouth}
          stroke="#2D2438"
          strokeWidth="2"
          fill={face.mouthFill}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sparkles (excited / laughing) */}
        {face.sparkles && !prefersReduced && (
          <>
            <path d="M58 18 l1 -3 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 z" fill="#F4C2D7" opacity="0.85">
              <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
            </path>
            <path d="M6 22 l0.6 -1.6 l0.6 1.6 l1.6 0.6 l-1.6 0.6 l-0.6 1.6 l-0.6 -1.6 l-1.6 -0.6 z" fill="#A8D5F2" opacity="0.85">
              <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="0.4s" repeatCount="indefinite" />
            </path>
          </>
        )}
      </svg>
    </div>
  );
}
