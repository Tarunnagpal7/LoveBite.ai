// filepath: c:\Users\Hp\Desktop\project\components\loading.tsx
import React from 'react';
import { Heart } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Heart className="h-12 w-12 text-primary animate-pulse" />
    </div>
  );
};

export default Loading;