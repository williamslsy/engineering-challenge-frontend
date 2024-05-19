import { cn } from '@/lib/utils';
import Skeleton from './skeleton';

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-8 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="grid grid-cols-3 gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
