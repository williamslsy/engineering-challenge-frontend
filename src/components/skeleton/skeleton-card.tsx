import { cn } from '@/lib/utils';
import Skeleton from './skeleton';

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton height="2.5rem" width="10rem" className="h-10 w-40" />
      <Skeleton height="3rem" className="h-8 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton height="3rem" className="h-8 w-full" />
        <Skeleton height="3rem" className="h-8 w-full" />
        <Skeleton height="3rem" className="h-8 w-full" />
      </div>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="grid grid-cols-3 gap-4">
          <Skeleton height="3rem" className="h-8 w-full" />
          <Skeleton height="3rem" className="h-8 w-full" />
          <Skeleton height="3rem" className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
