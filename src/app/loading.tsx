import SkeletonCard from '@/components/skeleton-card';

export default function Loading() {
  return (
    <div className="flex flex-col justify-center max-w-[1100px] mx-auto px-[20px] py-24 gap-20">
      <SkeletonCard className="w-full mb-8" />
      <div className="w-full flex flex-col gap-8">
        <SkeletonCard className="w-full" />
        <SkeletonCard className="w-full" />
      </div>
    </div>
  );
}
