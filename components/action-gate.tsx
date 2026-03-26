'use client';

import { useState, cloneElement, isValidElement } from 'react';
import { TrialActionModal } from '@/components/trial-action-modal';
import { useSubscription } from '@/contexts/subscription-context';

interface ActionGateProps {
  /** True when user is on trial or has no active subscription. */
  isLocked: boolean;
  children: React.ReactNode;
  /** Human-readable name of the thing being exported/downloaded, e.g. "audit package", "policy PDF" */
  documentType?: string;
}

/**
 * Wraps any button or clickable element. When isLocked=true, the child renders
 * visually identical but clicking opens TrialActionModal instead of performing
 * the real action. When isLocked=false, children pass through untouched.
 *
 * Uses SubscriptionContext to determine whether to show "Continue trial" in the modal.
 */
export function ActionGate({ isLocked, children, documentType }: ActionGateProps) {
  const [showModal, setShowModal] = useState(false);
  const { subscriptionStatus } = useSubscription();

  if (!isLocked) return <>{children}</>;

  const isExpired = subscriptionStatus === 'expired';

  const intercepted = isValidElement(children)
    ? cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        },
      })
    : children;

  return (
    <>
      {intercepted}
      <TrialActionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        documentType={documentType}
        isExpired={isExpired}
      />
    </>
  );
}
