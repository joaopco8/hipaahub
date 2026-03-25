'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

interface CrispChatProps {
  userEmail?: string;
  userName?: string;
}

export function CrispChat({ userEmail, userName }: CrispChatProps) {
  const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  useEffect(() => {
    if (!websiteId) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    if (userEmail) window.$crisp.push(['set', 'user:email', [userEmail]]);
    if (userName) window.$crisp.push(['set', 'user:nickname', [userName]]);

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [websiteId, userEmail, userName]);

  return null;
}
