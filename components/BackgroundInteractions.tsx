
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface EmojiParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
  opacity: number;
  rotation: number;
}

const POSITIVE_EMOJIS = ['✨', '🌟', '💛', '👍', '😊', '🙌'];

const BackgroundInteractions: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState({ x: 0, y: 0 });
  const [isOverCard, setIsOverCard] = useState(false);
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const cardRef = useRef<HTMLElement | null>(null);
  const nextId = useRef(0);
  const requestRef = useRef<number>();
  const lastClickTime = useRef(0);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Track cursor position and check if it's over the central card
  useEffect(() => {
    cardRef.current = document.querySelector('main');

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const over = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        );
        setIsOverCard(over);
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Throttle clicks
      const now = Date.now();
      if (now - lastClickTime.current < 200) return;
      
      // Don't trigger if clicking inside the card
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) return;
      }

      lastClickTime.current = now;
      spawnConfetti(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const spawnConfetti = (x: number, y: number) => {
    if (prefersReducedMotion) return;
    
    const count = Math.floor(Math.random() * 5) + 6; // 6-10 emojis
    const newParticles: EmojiParticle[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: nextId.current++,
        x,
        y,
        emoji: POSITIVE_EMOJIS[Math.floor(Math.random() * POSITIVE_EMOJIS.length)],
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() * -10) - 5, // Upward initial burst
        opacity: 1,
        rotation: Math.random() * 360,
      });
    }

    setParticles(prev => [...prev, ...newParticles].slice(-50)); // Limit total particles
  };

  // Physics and Follower Lag Loop
  const animate = useCallback(() => {
    // 1. Smooth follower lag
    setFollowerPos(prev => ({
      x: prev.x + (mousePos.x - prev.x) * 0.1,
      y: prev.y + (mousePos.y - prev.y) * 0.1,
    }));

    // 2. Particle physics
    setParticles(prev => 
      prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.4, // Gravity
          opacity: p.opacity - 0.02,
          rotation: p.rotation + p.vx,
        }))
        .filter(p => p.opacity > 0)
    );

    requestRef.current = requestAnimationFrame(animate);
  }, [mousePos, prefersReducedMotion]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Cursor Follower */}
      <div 
        style={{ 
          transform: `translate3d(${followerPos.x}px, ${followerPos.y}px, 0)`,
          opacity: isOverCard ? 0 : 0.3,
          transition: 'opacity 0.4s ease'
        }}
        className="absolute top-0 left-0 -ml-3 -mt-3 text-xl select-none"
      >
        <div className="animate-bounce" style={{ animationDuration: '3s' }}>
          🙂
        </div>
      </div>

      {/* Confetti Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-0 left-0 text-lg select-none"
          style={{
            transform: `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};

export default BackgroundInteractions;
