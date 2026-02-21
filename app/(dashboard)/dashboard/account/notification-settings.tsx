'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Bell, AtSign, EyeOff } from 'lucide-react';

export function NotificationSettings() {
  const [isEverythingToggled, setIsEverythingToggled] = useState(false);
  const [isAvailableToggled, setIsAvailableToggled] = useState(true);
  const [isNotificationToggled, setIsNotificationToggled] = useState(true);

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between p-4 rounded-none border transition-colors ${
          isEverythingToggled 
            ? 'border-[#00bceb] bg-[#00bceb]/10' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEverythingToggled ? 'bg-green-100' : 'bg-zinc-100'}`}>
            <Bell className={`h-5 w-5 ${isEverythingToggled ? 'text-green-600' : 'text-zinc-600'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Everything</p>
            <p className="text-sm text-zinc-600">
              Email digest, mentions & all activity
            </p>
          </div>
        </div>
        <Switch
          id="notification-everything"
          checked={isEverythingToggled}
          onCheckedChange={setIsEverythingToggled}
        />
      </div>
      
      <div
        className={`flex items-center justify-between p-4 rounded-none border transition-colors ${
          isAvailableToggled 
            ? 'border-[#00bceb] bg-[#00bceb]/10' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isAvailableToggled ? 'bg-green-100' : 'bg-zinc-100'}`}>
            <AtSign className={`h-5 w-5 ${isAvailableToggled ? 'text-green-600' : 'text-zinc-600'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Available</p>
            <p className="text-sm text-zinc-600">
              Only mentions and comments
            </p>
          </div>
        </div>
        <Switch
          id="notification-available"
          checked={isAvailableToggled}
          onCheckedChange={setIsAvailableToggled}
        />
      </div>
      
      <div
        className={`flex items-center justify-between p-4 rounded-none border transition-colors ${
          isNotificationToggled 
            ? 'border-[#00bceb] bg-[#00bceb]/10' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isNotificationToggled ? 'bg-green-100' : 'bg-zinc-100'}`}>
            <EyeOff className={`h-5 w-5 ${isNotificationToggled ? 'text-green-600' : 'text-zinc-600'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Ignoring</p>
            <p className="text-sm text-zinc-600">
              Turn off all notifications
            </p>
          </div>
        </div>
        <Switch
          id="notification-ignoring"
          checked={isNotificationToggled}
          onCheckedChange={setIsNotificationToggled}
        />
      </div>
    </div>
  );
}
