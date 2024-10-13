import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import type { MirrorablePublication } from "@hey/lens";
import { Tooltip } from "@hey/ui";
import type { FC } from "react";
import { useGlobalAlertStateStore } from "src/store/non-persisted/useGlobalAlertStateStore";

interface ModProps {
  isFullPublication?: boolean;
  publication: MirrorablePublication;
}

const Mod: FC<ModProps> = ({ isFullPublication = false, publication }) => {
  const { setShowGardenerActionsAlert } = useGlobalAlertStateStore();

  const iconClassName = isFullPublication
    ? "w-[17px] sm:w-[20px]"
    : "w-[15px] sm:w-[18px]";

  return (
    <button
      aria-label="Mod"
      className="rounded-full p-1.5 text-yellow-600 outline-offset-2 hover:bg-yellow-400/20"
      onClick={() => setShowGardenerActionsAlert(true, publication)}
      type="button"
    >
      <Tooltip content="Mod actions" placement="top" withDelay>
        <ShieldCheckIcon className={iconClassName} />
      </Tooltip>
    </button>
  );
};

export default Mod;
