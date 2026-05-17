'use client';

import { useEffect, useRef, useState } from 'react';

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

export function MascotLarge() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [emotion, setEmotion] = useState('happy');
  const [hover, setHover] = useState(false);
  const lastMoveRef = useRef(Date.now());

  useEffect(() => {
    function onMove(e: MouseEvent) {
      lastMoveRef.current = Date.now();
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const k = Math.min(1, dist / 240);
      const ang = Math.atan2(dy, dx);
      setEye({ x: Math.cos(ang) * 2.6 * k, y: Math.sin(ang) * 2.4 * k });
      setTilt({ x: Math.cos(ang) * 6 * k, y: Math.sin(ang) * 5 * k });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let to: NodeJS.Timeout;
    function loop() {
      const delay = 2400 + Math.random() * 3800;
      to = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlink(true);
              setTimeout(() => setBlink(false), 130);
            }, 180);
          }
          loop();
        }, 140);
      }, delay);
    }
    loop();
    return () => clearTimeout(to);
  }, []);

  useEffect(() => {
    const seq = ['happy', 'curious', 'happy', 'wink', 'excited', 'happy'];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setEmotion(seq[i]);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - lastMoveRef.current > 2500) {
        const a = Math.random() * Math.PI * 2;
        setEye({ x: Math.cos(a) * 2, y: Math.sin(a) * 1.6 });
        setTilt({ x: Math.cos(a) * 4, y: Math.sin(a) * 3 });
      }
    }, 1800);
    return () => clearInterval(t);
  }, []);

  let mouth = 'M26 42 Q32 46 38 42';
  let mouthFill = 'none';
  if (emotion === 'curious') mouth = 'M30 42 Q32 44.5 34 42';
  if (emotion === 'excited' || hover) {
    mouth = 'M24 41 Q32 49 40 41 Q32 45 24 41 Z';
    mouthFill = '#2D2438';
  }
  const isWink = emotion === 'wink' && !blink;
  const browLift = emotion === 'curious' ? -3 : 0;

  return (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: 140, height: 140, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
    >
      <svg
        width="140" height="140" viewBox="0 0 64 64" aria-hidden="true"
        style={{
          transform: `translate(${tilt.x * 0.15}px, ${tilt.y * 0.15}px) rotate(${tilt.x * 0.4}deg)`,
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

        <circle cx="32" cy="34" r="30" fill="url(#bigGlow)">
          <animate attributeName="r" values="30;33;30" dur="4s" repeatCount="indefinite" />
        </circle>

        <g style={{
          transformOrigin: '32px 12px',
          transform: hover || emotion === 'excited' ? 'rotate(-6deg)' : 'rotate(0deg)',
          transition: 'transform 300ms',
        }}>
          <line x1="32" y1="6" x2="32" y2="12" stroke="#9B87D9" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="4.5" r="3" fill="#F4C2D7">
            <animate attributeName="r" values="3;3.5;3" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>

        <rect x="10" y="12" width="44" height="40" rx="14" fill="url(#bigBody)" />
        <rect x="10" y="12" width="44" height="24" rx="14" fill="url(#bigShine)" />
        <rect x="6" y="28" width="4" height="10" rx="2" fill="#9B87D9" />
        <rect x="54" y="28" width="4" height="10" rx="2" fill="#9B87D9" />

        <circle cx="18" cy="38" r="3" fill="#F4C2D7" opacity={emotion === 'excited' || hover ? 1 : 0.7} />
        <circle cx="46" cy="38" r="3" fill="#F4C2D7" opacity={emotion === 'excited' || hover ? 1 : 0.7} />

        <line x1="19" y1={22 + browLift} x2="29" y2={23 + browLift}
              stroke="#9B87D9" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
        <line x1="35" y1={23 + browLift} x2="45" y2={22 + browLift}
              stroke="#9B87D9" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />

        <g style={{
          transform: blink ? 'scaleY(0.08)' : 'scaleY(1)',
          transformOrigin: '24px 30px',
          transition: 'transform 90ms ease',
        }}>
          {isWink ? (
            <path d="M20 30 Q24 27 28 30" stroke="#2D2438" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx={24 + eye.x} cy={30 + eye.y} rx="3.7" ry="4.7" fill="#2D2438" />
              <circle cx={25 + eye.x} cy={28.5 + eye.y} r="1.3" fill="#fff" />
            </>
          )}
        </g>

        <g style={{
          transform: blink ? 'scaleY(0.08)' : 'scaleY(1)',
          transformOrigin: '40px 30px',
          transition: 'transform 90ms ease',
        }}>
          <ellipse cx={40 + eye.x} cy={30 + eye.y} rx="3.7" ry="4.7" fill="#2D2438" />
          <circle cx={41 + eye.x} cy={28.5 + eye.y} r="1.3" fill="#fff" />
        </g>

        <path d={mouth} stroke="#2D2438" strokeWidth="2" fill={mouthFill}
              strokeLinecap="round" strokeLinejoin="round" />

        {(emotion === 'excited' || hover) && (
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
