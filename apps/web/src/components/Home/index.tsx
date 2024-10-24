import NewPost from "@components/Composer/NewPost";
import ExploreFeed from "@components/Explore/Feed";
import Feed from "@components/List/Feed";
import { Leafwatch } from "@helpers/leafwatch";
import { HomeFeedType } from "@hey/data/enums";
import { PAGEVIEW } from "@hey/data/tracking";
import { GridItemEight, GridItemFour, GridLayout } from "@hey/ui";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useProfileStore } from "src/store/persisted/useProfileStore";
import FeedType from "./FeedType";
import ForYou from "./ForYou";
import Hero from "./Hero";
import PaidActions from "./PaidActions";
import Sidebar from "./Sidebar";
import Timeline from "./Timeline";

const Home: NextPage = () => {
  const { currentProfile } = useProfileStore();
  const [feedType, setFeedType] = useState<HomeFeedType>(
    HomeFeedType.FOLLOWING
  );
  const [pinnedListId, setPinnedListId] = useState<string | null>(null);

  useEffect(() => {
    Leafwatch.track(PAGEVIEW, { page: "home" });
  }, []);

  const loggedInWithProfile = Boolean(currentProfile);

  return (
    <>
      {!loggedInWithProfile && <Hero />}
      <GridLayout>
        <GridItemEight className="space-y-5">
          {loggedInWithProfile ? (
            <>
              <NewPost />
              <FeedType
                feedType={feedType}
                setFeedType={setFeedType}
                pinnedListId={pinnedListId}
                setPinnedListId={setPinnedListId}
              />
              {feedType === HomeFeedType.FOLLOWING ? (
                <Timeline />
              ) : feedType === HomeFeedType.FORYOU ? (
                <ForYou />
              ) : feedType === HomeFeedType.PREMIUM ? (
                <PaidActions />
              ) : feedType === HomeFeedType.PINNED && pinnedListId ? (
                <Feed id={pinnedListId} />
              ) : null}
            </>
          ) : (
            <ExploreFeed />
          )}
        </GridItemEight>
        <GridItemFour>
          <Sidebar />
        </GridItemFour>
      </GridLayout>
    </>
  );
};

export default Home;
