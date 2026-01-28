import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 bg-white">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-extralight">404 - Page Not Found</h2>
        <p className="text-zinc-600 font-extralight">
          The page you're looking for doesn't exist.
        </p>
        <Button asChild className="font-extralight">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
