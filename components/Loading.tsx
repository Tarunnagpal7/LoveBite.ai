// filepath: c:\Users\Hp\Desktop\project\components\loading.tsx
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

const Loading = () => {
  const [hearts, setHearts] = useState<Array<{ id: number, left: number, duration: number, size: number, delay: number }>>([]);

  useEffect(() => {
    // Create initial hearts
    const initialHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // random horizontal position (0-100%)
      duration: 3 + Math.random() * 4, // random animation duration (3-7s)
      size: 4 + Math.random() * 8, // random size (4-12)
      delay: Math.random() * 2, // random delay (0-2s)
    }));
    
    setHearts(initialHearts);
    
    // Add new hearts periodically
    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 100,
          duration: 3 + Math.random() * 4,
          size: 4 + Math.random() * 8,
          delay: 0,
        }
      ]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-w-fit overflow-hidden">
      {/* Main loading indicator */}
      <div className="z-10">
        <Heart className="h-16 w-16 text-primary animate-pulse" />
        <p className="mt-4 text-primary font-medium text-lg animate-pulse">Loading...</p>
      </div>
      
      {/* Floating hearts */}
      <div className="absolute inset-0 w-full h-full">
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
              className={`w-${Math.round(heart.size)} h-${Math.round(heart.size)} text-primary/40`} 
            />
          </div>
        ))}
      </div>
      
      {/* CSS animations */}
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