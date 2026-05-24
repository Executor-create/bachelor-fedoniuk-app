import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiStar,
  FiX,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import {
  activateSubscription,
  cancelSubscription,
  getFeatures,
  type FeaturesResponse,
} from '../api/subscriptions';
import {
  featureLabel,
  formatDate,
  formatSubscriptionStatus,
  hasPremiumAccess,
} from '../utils/subscriptionUtils';

type ToastState = { message: string; type: 'success' | 'error' } | null;

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-2xl text-sm font-semibold ${
            toast.type === 'success'
              ? 'border-violet-500/40 bg-violet-950/90 text-violet-100'
              : 'border-red-500/40 bg-red-950/90 text-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <FiCheck size={16} className="text-violet-400" />
          ) : (
            <FiAlertCircle size={16} className="text-red-400" />
          )}
          {toast.message}
          <button
            type="button"
            onClick={onDismiss}
            className="ml-2 opacity-60 hover:opacity-100 transition"
          >
            <FiX size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CancelDialog({
  endDate,
  onConfirm,
  onClose,
  isSubmitting,
}: {
  endDate: string | null;
  onConfirm: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-white">
          Cancel subscription?
        </h3>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          You will lose Premium access on{' '}
          <span className="font-semibold text-white">
            {formatDate(endDate)}
          </span>
          . Until then, all features remain available.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition"
          >
            Keep Premium
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition"
          >
            {isSubmitting ? 'Canceling...' : 'Cancel Plan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureRow({
  label,
  inFree,
  inPremium,
}: {
  label: string;
  inFree: boolean;
  inPremium: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-zinc-800 last:border-0 items-center">
      <span className="text-sm text-zinc-300 col-span-1">{label}</span>
      <div className="flex justify-center">
        {inFree ? (
          <FiCheck size={16} className="text-emerald-400" />
        ) : (
          <FiX size={16} className="text-zinc-600" />
        )}
      </div>
      <div className="flex justify-center">
        {inPremium ? (
          <FiCheck size={16} className="text-violet-400" />
        ) : (
          <FiX size={16} className="text-zinc-600" />
        )}
      </div>
    </div>
  );
}

const UpgradePage = () => {
  const { user, refreshUser } = useAuth();

  const [features, setFeatures] = useState<FeaturesResponse | null>(null);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [featuresError, setFeaturesError] = useState<string | null>(null);
  const [premiumNotice, setPremiumNotice] = useState<string | null>(null);

  const [isActivating, setIsActivating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const isPremium = hasPremiumAccess(user);
  const isCanceled = user?.subscriptionStatus === 'CANCELED';
  const showCancelButton = isPremium && user?.subscriptionStatus === 'ACTIVE';

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let active = true;
    setFeaturesLoading(true);
    setFeaturesError(null);

    getFeatures()
      .then((data) => {
        if (active) setFeatures(data);
      })
      .catch(() => {
        if (active) setFeaturesError('Could not load features.');
      })
      .finally(() => {
        if (active) setFeaturesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setPremiumNotice(
        detail?.message || 'Premium subscription required for this action.',
      );
    };

    window.addEventListener('premium-required', handler);
    return () => window.removeEventListener('premium-required', handler);
  }, []);

  const handleActivate = async () => {
    if (isActivating) return;
    setIsActivating(true);

    try {
      await activateSubscription();
      await refreshUser();
      showToast('Premium activated. Welcome!', 'success');
    } catch {
      showToast('Could not activate subscription. Please try again.', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (isCanceling) return;
    setIsCanceling(true);

    try {
      const data = await cancelSubscription();
      await refreshUser();
      setShowCancelDialog(false);
      showToast(
        `Your premium access continues until ${formatDate(
          data.subscriptionEndDate,
        )}.`,
        'success',
      );
    } catch (error: any) {
      const msg: string = error?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('already free')) {
        showToast('Your plan is already Free.', 'error');
      } else {
        showToast('Could not cancel subscription. Please try again.', 'error');
      }
      setShowCancelDialog(false);
    } finally {
      setIsCanceling(false);
    }
  };

  const allFeatureKeys: string[] = features
    ? [...new Set([...features.free, ...features.premium])]
    : [];

  const freeHighlights = (features?.free ?? []).slice(0, 4);
  const premiumHighlights = (features?.premium ?? []).slice(0, 4);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden text-white">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="page-enter relative flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          {premiumNotice && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200 flex items-start gap-3"
            >
              <FiAlertCircle className="mt-0.5 text-red-300" size={16} />
              <div className="flex-1">
                <p className="font-semibold text-red-100">{premiumNotice}</p>
                <p className="mt-1 text-xs text-red-200/80">
                  Upgrade to Premium to unlock this feature.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPremiumNotice(null)}
                className="text-xs font-semibold text-red-100 hover:text-white"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          <section className="max-w-4xl mx-auto mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <HiSparkles className="text-violet-300" size={14} />
              <span>Plans &amp; Pricing</span>
            </div>
            <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Unlock the full Klyro experience
            </h1>
            <p className="mt-4 text-base leading-7 text-zinc-400 max-w-xl">
              Upgrade to Premium for unlimited collections, profile
              customization, advanced analytics, and an exclusive badge.
            </p>
          </section>

          {user && (
            <section className="max-w-4xl mx-auto mb-8">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex items-center gap-4 rounded-2xl border px-5 py-4 ${
                  isPremium
                    ? 'border-violet-500/30 bg-violet-950/30'
                    : 'border-zinc-700 bg-zinc-900'
                }`}
              >
                <div
                  className={`rounded-xl p-2.5 ${
                    isPremium ? 'bg-violet-500/20' : 'bg-zinc-800'
                  }`}
                >
                  {isPremium ? (
                    <HiSparkles size={20} className="text-violet-300" />
                  ) : (
                    <FiStar size={20} className="text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {formatSubscriptionStatus(user)}
                  </p>
                  {isPremium && user.subscriptionEndDate && (
                    <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                      <FiClock size={11} />
                      {isCanceled ? 'Access until' : 'Renews'}{' '}
                      {formatDate(user.subscriptionEndDate)}
                    </p>
                  )}
                </div>
                {isCanceled && (
                  <span className="text-xs font-semibold text-amber-200 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                    Canceled
                  </span>
                )}
              </motion.div>
            </section>
          )}

          <section className="max-w-4xl mx-auto grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
              <div className="flex items-center gap-2 text-zinc-200">
                <FiStar size={18} className="text-zinc-400" />
                <h3 className="text-lg font-semibold">Free</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Great for getting started with your first collections.
              </p>
              <div className="mt-5 space-y-2">
                {(freeHighlights.length
                  ? freeHighlights
                  : [
                      'Basic profiles',
                      'Up to 3 collections',
                      'Community reviews',
                    ]
                ).map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <FiCheck size={14} className="text-emerald-400" />
                    <span>{featureLabel(feature)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-violet-500/40 bg-linear-to-br from-violet-600/20 via-zinc-900/70 to-zinc-900 p-6 shadow-lg shadow-violet-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <FiZap size={18} className="text-violet-300" />
                  <h3 className="text-lg font-semibold">Premium</h3>
                </div>
                {isPremium && (
                  <span className="text-xs font-semibold text-violet-100 border border-violet-400/40 bg-violet-500/20 rounded-full px-3 py-1">
                    Current plan
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                Unlimited collections, premium badge, and advanced analytics.
              </p>
              <div className="mt-5 space-y-2">
                {(premiumHighlights.length
                  ? premiumHighlights
                  : [
                      'Unlimited collections',
                      'Premium badge',
                      'Profile customization',
                    ]
                ).map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-200"
                  >
                    <FiCheck size={14} className="text-violet-300" />
                    <span>{featureLabel(feature)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {!isPremium && (
                  <button
                    type="button"
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="rounded-2xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-950/30 transition hover:bg-violet-400 disabled:opacity-60"
                  >
                    {isActivating ? 'Upgrading...' : 'Upgrade to Premium'}
                  </button>
                )}
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={() => setShowCancelDialog(true)}
                    className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
                  >
                    Cancel subscription
                  </button>
                )}
                {isPremium && !showCancelButton && (
                  <span className="text-xs text-zinc-400 self-center">
                    Manage your plan from this page at any time.
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-10">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-6">
              <div className="grid grid-cols-3 gap-4 pb-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
                <span>Feature</span>
                <span className="text-center">Free</span>
                <span className="text-center">Premium</span>
              </div>

              {featuresLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="h-4 rounded-full bg-zinc-800/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : featuresError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {featuresError}
                </div>
              ) : (
                allFeatureKeys.map((featureKey) => (
                  <FeatureRow
                    key={featureKey}
                    label={featureLabel(featureKey)}
                    inFree={features?.free.includes(featureKey) ?? false}
                    inPremium={features?.premium.includes(featureKey) ?? false}
                  />
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <AnimatePresence>
        {showCancelDialog && (
          <CancelDialog
            endDate={user?.subscriptionEndDate ?? null}
            onConfirm={handleCancelConfirm}
            onClose={() => setShowCancelDialog(false)}
            isSubmitting={isCanceling}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpgradePage;
