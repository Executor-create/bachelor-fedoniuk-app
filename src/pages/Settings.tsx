import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import EditProfileModal from '../components/Profile/EditProfileModal';
import { deleteMe } from '../api/users';

const Settings = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteMe();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.message ||
          'Failed to delete account. Please try again.',
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden text-white">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
              Settings
            </h1>
            <p className="text-sm text-zinc-400 mb-8">
              Manage your account preferences
            </p>

            {/* Render the edit form inline (always open, no close action) */}
            <EditProfileModal open={true} onClose={() => {}} inline />

            {/* Danger Zone */}
            <div className="mt-10 rounded-xl border border-red-800/50 bg-red-950/20 p-6">
              <h2 className="text-lg font-semibold text-red-400 mb-1">
                Danger Zone
              </h2>
              <p className="text-sm text-zinc-400 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 active:bg-red-800"
              >
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Delete your account?
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              This will permanently delete your account and all of your data —
              posts, reviews, collections, and everything else.{' '}
              <span className="text-red-400 font-medium">
                This cannot be undone.
              </span>
            </p>

            {deleteError && (
              <p className="mb-4 rounded-lg bg-red-950/40 border border-red-800/50 px-3 py-2 text-sm text-red-400">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting && (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isDeleting ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
