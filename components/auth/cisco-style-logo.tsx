import React from 'react';
import Image from 'next/image';

export const CiscoStyleLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="relative h-8 w-auto">
        <Image 
          src="/logoescura.png" 
          alt="HIPAA Hub" 
          width={150}
          height={32}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
};
