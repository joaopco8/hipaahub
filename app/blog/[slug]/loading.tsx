import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPostLoading() {
  return (
    <article className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <Skeleton className="w-full h-64 md:h-96 mb-12 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </article>
  );
}
