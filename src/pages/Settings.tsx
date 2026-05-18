import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import EditProfileModal from '../components/Profile/EditProfileModal';

const Settings = () => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
