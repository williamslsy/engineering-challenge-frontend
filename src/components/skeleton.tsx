import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function Skeleton({ className, width = 'full', height = '4' }: SkeletonProps) {
  const widthClass = `w-${width}`;
  const heightClass = `h-${height}`;
  return <div className={cn('animate-pulse rounded-md bg-gray-300 dark:bg-gray-700', widthClass, heightClass, className)} />;
}
