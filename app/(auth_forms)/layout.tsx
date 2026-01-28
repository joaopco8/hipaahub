import React from 'react';

interface AuthFormsLayoutProps {
  children: React.ReactNode;
}

export default function AuthFormsLayout({ children }: AuthFormsLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}

