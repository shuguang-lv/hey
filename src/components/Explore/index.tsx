import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout';
import RecommendedProfiles from '@components/Home/RecommendedProfiles';
import Footer from '@components/Shared/Footer';
import PublicationsShimmer from '@components/Shared/Shimmer/PublicationsShimmer';
import Seo from '@components/utils/Seo';
import { PublicationSortCriteria } from '@generated/types';
import { Mixpanel } from '@lib/mixpanel';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { APP_NAME } from 'src/constants';
import { PAGEVIEW } from 'src/tracking';

import FeedType from './FeedType';

const Feed = dynamic(() => import('./Feed'), {
  loading: () => <PublicationsShimmer />
});

const Explore: NextPage = () => {
  const {
    query: { type }
  } = useRouter();
  const [feedType, setFeedType] = useState(
    type && ['top_commented', 'top_collected', 'top_mirrored', 'latest'].includes(type as string)
      ? type.toString().toUpperCase()
      : PublicationSortCriteria.TopCommented
  );

  useEffect(() => {
    Mixpanel.track(PAGEVIEW.EXPLORE);
  }, []);

  return (
    <GridLayout>
      <Seo
        title={`Explore • ${APP_NAME}`}
        description={`Explore top commented, collected and latest publications in the ${APP_NAME}.`}
      />
      <GridItemEight className="space-y-5">
        <FeedType setFeedType={setFeedType} feedType={feedType} />
        <Feed feedType={feedType} />
      </GridItemEight>
      <GridItemFour>
        <RecommendedProfiles />
        <Footer />
      </GridItemFour>
    </GridLayout>
  );
};

export default Explore;
