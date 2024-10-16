import { Leafwatch } from "@helpers/leafwatch";
import { GifIcon } from "@heroicons/react/24/outline";
import { PUBLICATION } from "@hey/data/tracking";
import type { IGif } from "@hey/types/giphy";
import { Modal, Tooltip } from "@hey/ui";
import type { FC } from "react";
import { useState } from "react";
import { usePublicationAttachmentStore } from "src/store/non-persisted/publication/usePublicationAttachmentStore";
import GifSelector from "./GifSelector";

interface GiphyProps {
  setGifAttachment: (gif: IGif) => void;
}

const Gif: FC<GiphyProps> = ({ setGifAttachment }) => {
  const { attachments } = usePublicationAttachmentStore((state) => state);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Tooltip content="GIF" placement="top">
        <button
          aria-label="GIF"
          className="rounded-full outline-offset-8"
          disabled={attachments.length >= 4}
          onClick={() => {
            setShowModal(!showModal);
            Leafwatch.track(PUBLICATION.OPEN_GIFS);
          }}
          type="button"
        >
          <GifIcon className="size-5" />
        </button>
      </Tooltip>
      <Modal
        onClose={() => setShowModal(false)}
        show={showModal}
        title="Select GIF"
      >
        <GifSelector
          setGifAttachment={setGifAttachment}
          setShowModal={setShowModal}
        />
      </Modal>
    </>
  );
};

export default Gif;
