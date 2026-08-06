import React from 'react';
import { motion } from 'framer-motion';

export function ParticlesBackground() {
  // Generate random particles
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-transparent pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/10"
          initial={{
            x: `${p.x}vw`,
            y: `${p.y}vh`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: [`${p.x}vw`, `${p.x + (Math.random() * 20 - 10)}vw`, `${p.x}vw`],
            y: [`${p.y}vh`, `${p.y + (Math.random() * 20 - 10)}vh`, `${p.y}vh`],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
          style={{
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}
