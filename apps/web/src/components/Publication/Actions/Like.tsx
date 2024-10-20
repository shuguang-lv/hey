import type { ApolloCache } from "@apollo/client";
import errorToast from "@helpers/errorToast";
import { Leafwatch } from "@helpers/leafwatch";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Errors } from "@hey/data/errors";
import { PUBLICATION } from "@hey/data/tracking";
import nFormatter from "@hey/helpers/nFormatter";
import type { MirrorablePublication, ReactionRequest } from "@hey/lens";
import {
  PublicationReactionType,
  useAddReactionMutation,
  useRemoveReactionMutation
} from "@hey/lens";
import { Tooltip } from "@hey/ui";
import cn from "@hey/ui/cn";
import { useCounter, useToggle } from "@uidotdev/usehooks";
import type { FC } from "react";
import toast from "react-hot-toast";
import { useProfileStatus } from "src/store/non-persisted/useProfileStatus";
import { useProfileStore } from "src/store/persisted/useProfileStore";

interface LikeProps {
  publication: MirrorablePublication;
  showCount: boolean;
}

const Like: FC<LikeProps> = ({ publication, showCount }) => {
  const { currentProfile } = useProfileStore();
  const { isSuspended } = useProfileStatus();

  const [hasReacted, toggleReact] = useToggle(
    publication.operations.hasReacted
  );
  const [reactions, { decrement, increment }] = useCounter(
    publication.stats.reactions
  );

  const updateCache = (cache: ApolloCache<any>) => {
    cache.modify({
      fields: {
        operations: (existingValue) => {
          return {
            ...existingValue,
            // TODO: This is a hack to make the cache update
            'hasReacted({"request":{"type":"UPVOTE"}})': !hasReacted
          };
        }
      },
      id: cache.identify(publication)
    });
    cache.modify({
      fields: {
        reactions: () => (hasReacted ? reactions - 1 : reactions + 1)
      },
      id: cache.identify(publication.stats)
    });
  };

  const onError = (error: any) => {
    errorToast(error);
  };

  const eventProperties = { publication_id: publication?.id };

  const [addReaction] = useAddReactionMutation({
    onCompleted: () => Leafwatch.track(PUBLICATION.LIKE, eventProperties),
    onError: (error) => {
      toggleReact();
      decrement();
      onError(error);
    },
    update: updateCache
  });

  const [removeReaction] = useRemoveReactionMutation({
    onCompleted: () => Leafwatch.track(PUBLICATION.UNLIKE, eventProperties),
    onError: (error) => {
      toggleReact();
      increment();
      onError(error);
    },
    update: updateCache
  });

  const createLike = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    if (isSuspended) {
      return toast.error(Errors.Suspended);
    }

    const request: ReactionRequest = {
      for: publication.id,
      reaction: PublicationReactionType.Upvote
    };

    toggleReact();

    if (hasReacted) {
      decrement();
      return await removeReaction({ variables: { request } });
    }

    increment();
    return await addReaction({ variables: { request } });
  };

  const iconClassName = showCount
    ? "w-[17px] sm:w-[20px]"
    : "w-[15px] sm:w-[18px]";

  return (
    <div
      className={cn(
        hasReacted ? "text-brand-500" : "ld-text-gray-500",
        "flex items-center space-x-1"
      )}
    >
      <button
        aria-label="Like"
        className={cn(
          hasReacted ? "hover:bg-brand-300/20" : "hover:bg-gray-300/20",
          "rounded-full p-1.5 outline-offset-2"
        )}
        onClick={createLike}
        type="button"
      >
        <Tooltip
          content={hasReacted ? "Unlike" : "Like"}
          placement="top"
          withDelay
        >
          {hasReacted ? (
            <HeartIconSolid className={iconClassName} />
          ) : (
            <HeartIcon className={iconClassName} />
          )}
        </Tooltip>
      </button>
      {reactions > 0 && !showCount ? (
        <span className="text-[11px] sm:text-xs">{nFormatter(reactions)}</span>
      ) : null}
    </div>
  );
};

export default Like;
