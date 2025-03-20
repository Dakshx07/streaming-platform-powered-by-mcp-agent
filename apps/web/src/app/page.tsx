import { Suspense } from 'react';
import { FeaturedStreams } from '@/components/featured-streams';
import { Categories } from '@/components/categories';
import { RecommendedChannels } from '@/components/recommended-channels';
import { StreamSkeleton } from '@/components/skeletons/stream-skeleton';
import { CategorySkeleton } from '@/components/skeletons/category-skeleton';
import { ChannelSkeleton } from '@/components/skeletons/channel-skeleton';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Streams</h2>
        <Suspense fallback={<StreamSkeleton count={3} />}>
          <FeaturedStreams />
        </Suspense>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
        <Suspense fallback={<CategorySkeleton count={8} />}>
          <Categories />
        </Suspense>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Recommended Channels</h2>
        <Suspense fallback={<ChannelSkeleton count={4} />}>
          <RecommendedChannels />
        </Suspense>
      </section>
    </div>
  );
}