import ProfileListShimmer from "@components/Shared/Shimmer/ProfileListShimmer";
import { getAuthApiHeaders } from "@helpers/getAuthApiHeaders";
import { UsersIcon } from "@heroicons/react/24/outline";
import { HEY_API_URL } from "@hey/data/constants";
import getLists from "@hey/helpers/api/lists/getLists";
import getProfile from "@hey/helpers/getProfile";
import type { List } from "@hey/types/hey";
import { Button, EmptyState, ErrorMessage } from "@hey/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type FC, useState } from "react";
import toast from "react-hot-toast";
import { useGlobalModalStateStore } from "src/store/non-persisted/useGlobalModalStateStore";
import { useProfileStore } from "src/store/persisted/useProfileStore";
import SingleList from "../SingleList";

const AddToList: FC = () => {
  const { currentProfile } = useProfileStore();
  const { profileToAddToList } = useGlobalModalStateStore();
  const [isAdding, setIsAdding] = useState(false);
  const [addingListId, setAddingListId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["getAllLists", profileToAddToList?.id],
    queryFn: () =>
      getLists({ id: currentProfile?.id, viewingId: profileToAddToList?.id })
  });

  if (isLoading) {
    return <ProfileListShimmer />;
  }

  if (data?.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon className="size-8" />}
        message={
          <div>
            <span className="mr-1 font-bold">
              {getProfile(currentProfile).slugWithPrefix}
            </span>
            <span>doesn't have any lists yet.</span>
          </div>
        }
        hideCard
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        className="m-5"
        error={error}
        title="Failed to load lists"
      />
    );
  }

  const handleAddToList = async (listId: string, add: boolean) => {
    try {
      setIsAdding(true);
      setAddingListId(listId);
      await toast.promise(
        axios.post(
          `${HEY_API_URL}/lists/add`,
          {
            listId,
            profileId: profileToAddToList?.id,
            add
          },
          { headers: getAuthApiHeaders() }
        ),
        {
          loading: "Adding to list...",
          error: "Failed to add to list",
          success: () => {
            queryClient.setQueryData<List[]>(
              ["getAllLists", profileToAddToList?.id],
              (oldData) =>
                oldData?.map((list) =>
                  list.id === listId
                    ? {
                        ...list,
                        isAdded: add,
                        count: add ? list.count + 1 : list.count - 1
                      }
                    : list
                )
            );

            return "Added to list";
          }
        }
      );
    } finally {
      setIsAdding(false);
      setAddingListId(null);
    }
  };

  return (
    <div className="space-y-5 p-5">
      {data?.map((list) => (
        <div key={list.id} className="flex items-center justify-between">
          <SingleList list={list} linkToList={false} />
          <Button
            size="sm"
            onClick={() => handleAddToList(list.id, !list.isAdded)}
            disabled={isAdding && addingListId === list.id}
            outline
          >
            {list.isAdded ? "Remove" : "Add"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AddToList;