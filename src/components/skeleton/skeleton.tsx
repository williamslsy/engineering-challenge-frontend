import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function Skeleton({ className, width = '100%', height = '1rem' }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-gray-300 dark:bg-gray-700', className)} style={{ width, height }} />;
}
