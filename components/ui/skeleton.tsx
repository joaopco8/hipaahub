import { cn } from '@/utils/cn';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-zinc-200',
        className
      )}
      style={{
        animation: 'shimmer 1.3s linear infinite',
        background: 'linear-gradient(90deg, rgba(243, 245, 249, 0.6) 0%, rgba(243, 245, 249, 0.8) 50%, rgba(243, 245, 249, 0.6) 100%)',
        backgroundSize: '200% 100%'
      }}
      {...props}
    />
  );
}

export { Skeleton };
