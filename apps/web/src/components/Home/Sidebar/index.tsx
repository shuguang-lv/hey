import SignupCard from "@components/Shared/Auth/SignupCard";
import Footer from "@components/Shared/Footer";
import { IS_MAINNET } from "@hey/data/constants";
import type { FC } from "react";
import { memo } from "react";
import { useProfileStore } from "src/store/persisted/useProfileStore";
import EnableLensManager from "./EnableLensManager";
import Gitcoin from "./Gitcoin";
import HeyMembershipNft from "./HeyMembershipNft";
import SetProfile from "./SetProfile";
import StaffPicks from "./StaffPicks";
import WhoToFollow from "./WhoToFollow";

const Sidebar: FC = () => {
  const { currentProfile } = useProfileStore();
  const loggedInWithProfile = Boolean(currentProfile);
  const loggedOut = !loggedInWithProfile;

  return (
    <>
      <Gitcoin />
      {loggedOut && <SignupCard />}
      {loggedInWithProfile && IS_MAINNET && <HeyMembershipNft />}
      {/* Onboarding steps */}
      {loggedInWithProfile && (
        <>
          <EnableLensManager />
          <SetProfile />
        </>
      )}
      {/* Recommendations */}
      <StaffPicks />
      {loggedInWithProfile && <WhoToFollow />}
      <Footer />
    </>
  );
};

export default memo(Sidebar);
