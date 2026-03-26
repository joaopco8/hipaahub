'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  link: string;
  cta: string;
}

interface Props {
  items: ChecklistItem[];
}

export function OnboardingChecklist({ items }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const allDone = completed === total;
  const pct = Math.round((completed / total) * 100);

  if (dismissed && !allDone) return null;
  if (allDone) return null;

  return (
    <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-[#00bceb]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-light text-[#0e274e]">Get your practice protected</h3>
            <p className="text-xs text-gray-400 font-light mt-0.5">
              {completed} of {total} steps complete
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-300 hover:text-gray-500 mt-0.5"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-[#00bceb] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[#1ad07a]" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-light ${item.completed ? 'text-gray-400 line-through' : 'text-[#0e274e]'}`}>
                  {item.label}
                </p>
                {!item.completed && (
                  <p className="text-xs text-gray-400 font-light">{item.description}</p>
                )}
              </div>
              {!item.completed && (
                <Link href={item.link} className="flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-[#00bceb] hover:text-[#00a8d4] rounded-none px-2"
                  >
                    {item.cta}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
