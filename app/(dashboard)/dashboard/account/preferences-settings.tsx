'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Icons } from '@/components/icons';

export function PreferencesSettings() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="language" className="text-zinc-900">Language</Label>
        <Select defaultValue="en">
          <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="theme" className="text-zinc-900">Theme</Label>
        <Select value={theme} onValueChange={(value) => setTheme(value)}>
          <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <div className="flex items-center">
                <Icons.sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center">
                <Icons.moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </div>
            </SelectItem>
            <SelectItem value="system">
              <div className="flex items-center">
                <Icons.laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="font" className="text-zinc-900">Font</Label>
        <Select defaultValue="sans">
          <SelectTrigger className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans">Sans Serif</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="mono">Monospace</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
