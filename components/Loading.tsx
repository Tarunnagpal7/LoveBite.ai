import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const Loading = () => {
  const [hearts, setHearts] = useState<Array<{ id: number, left: number, duration: number, size: number, delay: number }>>([]);

  useEffect(() => {
    const initialHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90, // avoid going too close to the edges
      duration: 3 + Math.random() * 4,
      size: 16 + Math.random() * 24, // in px (16px to 40px)
      delay: Math.random() * 2,
    }));

    setHearts(initialHearts);

    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev,
        {
          id: Date.now(),
          left: 5 + Math.random() * 90,
          duration: 3 + Math.random() * 4,
          size: 16 + Math.random() * 24,
          delay: 0,
        }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      {/* Main loading indicator */}
      <div className="z-10">
        <Heart className="h-16 w-16 text-primary animate-pulse" />
        <p className="mt-4 text-primary font-medium text-lg animate-pulse">Loading...</p>
      </div>

      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute opacity-0"
            style={{
              left: `${heart.left}%`,
              bottom: '-10%',
              animation: `
                float-up ${heart.duration}s ease-in-out ${heart.delay}s forwards,
                fade-in-out ${heart.duration}s ease-in-out ${heart.delay}s forwards
              `,
            }}
          >
            <Heart
              fill="currentColor"
              className="text-primary/40"
              style={{
                width: `${heart.size}px`,
                height: `${heart.size}px`,
              }}
            />
          </div>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          20% {
            transform: translateY(-20vh) rotate(-10deg);
          }
          40% {
            transform: translateY(-40vh) rotate(10deg);
          }
          60% {
            transform: translateY(-60vh) rotate(-5deg);
          }
          80% {
            transform: translateY(-80vh) rotate(5deg);
          }
          100% {
            transform: translateY(-100vh) rotate(0deg);
          }
        }

        @keyframes fade-in-out {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
