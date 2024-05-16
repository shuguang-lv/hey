import type { FC } from 'react';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from '@headlessui/react';
import { ArrowUpRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { HelpTooltip } from '@hey/ui'; // Assuming HelpTooltip is from @hey/ui
import type { ActionData } from 'nft-openaction-kit';

import stopEventPropagation from '@hey/helpers/stopEventPropagation';

interface FeesDisclosureProps {
  actionData?: ActionData;
  bridgeFee: number;
  formattedTotalAmount: number;
  formattedTotalFees: number;
  loadingCurrencyDetails: boolean;
  tokenSymbol: string;
}

const FeesDisclosure: FC<FeesDisclosureProps> = ({
  actionData,
  bridgeFee,
  formattedTotalAmount,
  formattedTotalFees,
  loadingCurrencyDetails,
  tokenSymbol
}) => {
  return (
    <Disclosure>
      <div className="ld-text-gray-500 flex items-center justify-between space-y-0.5">
        <DisclosureButton
          className="flex items-center space-x-1.5"
          onClick={stopEventPropagation}
        >
          <span>Fees</span>
          <ChevronDownIcon className="size-3" strokeWidth={3} />
        </DisclosureButton>
        {loadingCurrencyDetails ? (
          <span className="shimmer h-6 w-24 rounded-lg bg-gray-200" />
        ) : (
          <span>
            {formattedTotalFees.toFixed(4)} {tokenSymbol}
          </span>
        )}
      </div>
      <DisclosurePanel className="mt-1.5 space-y-1 text-sm">
        <div className="ld-text-gray-500 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <ArrowUpRightIcon className="size-3" />
            <p>
              {actionData?.actArgumentsFormatted.dstChainId === 137
                ? 'Transaction Fee'
                : 'Bridge Fee'}
            </p>
          </span>
          {loadingCurrencyDetails ? (
            <span className="shimmer h-4 w-24 rounded-lg bg-gray-200" />
          ) : (
            <p>
              {bridgeFee.toFixed(4)} {tokenSymbol}
            </p>
          )}
        </div>
        <div className="ld-text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-2">
              <ArrowUpRightIcon className="size-3" />
              <p>Lens Creator Fee</p>
            </span>
            <HelpTooltip>
              <div className="max-w-xs py-1 leading-5">
                Lens creator fee is distributed between publication creator,
                application, Lens treasury, and mirror (if applicable)
              </div>
            </HelpTooltip>
          </div>
          {loadingCurrencyDetails ? (
            <span className="shimmer h-4 w-28 rounded-lg bg-gray-200" />
          ) : (
            <p>
              {(formattedTotalAmount * 0.05).toFixed(4)} {tokenSymbol}
            </p>
          )}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};

export default FeesDisclosure;