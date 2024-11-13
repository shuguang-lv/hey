import getAvatar from "@hey/helpers/getAvatar";
import getLennyURL from "@hey/helpers/getLennyURL";
import getProfile from "@hey/helpers/getProfile";
import { isRepost } from "@hey/helpers/postHelpers";
import stopEventPropagation from "@hey/helpers/stopEventPropagation";
import type { AnyPublication, FeedItem } from "@hey/lens";
import { Image } from "@hey/ui";
import cn from "@hey/ui/cn";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FC } from "react";
import { memo } from "react";

interface PostAvatarProps {
  feedItem?: FeedItem;
  publication: AnyPublication;
  quoted?: boolean;
}

const PostAvatar: FC<PostAvatarProps> = ({
  feedItem,
  publication,
  quoted = false
}) => {
  const { push } = useRouter();
  const targetPost = isRepost(publication)
    ? publication?.mirrorOn
    : publication;
  const rootPublication = feedItem ? feedItem?.root : targetPost;
  const profile = feedItem ? rootPublication.by : targetPost.by;

  return (
    <Link
      className="contents"
      href={getProfile(profile).link}
      onClick={stopEventPropagation}
    >
      <Image
        alt={profile.id}
        className={cn(
          quoted ? "size-6" : "size-11",
          "z-[1] cursor-pointer rounded-full border bg-gray-200 dark:border-gray-700"
        )}
        height={quoted ? 25 : 44}
        loading="lazy"
        onClick={() => push(getProfile(profile).link)}
        onError={({ currentTarget }) => {
          currentTarget.src = getLennyURL(profile.id);
        }}
        src={getAvatar(profile)}
        width={quoted ? 25 : 44}
      />
    </Link>
  );
};

export default memo(PostAvatar);
