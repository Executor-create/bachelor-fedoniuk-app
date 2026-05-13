import * as React from 'react';

const tabs = ['Favorite Games', 'Activity', 'Reviews'];

type ProfileTabsProps = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  vertical?: boolean;
};

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab = 'Favorite Games',
  onTabChange,
  vertical = false,
}) => {
  if (vertical) {
    return (
      <div className="flex flex-col items-stretch gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange?.(t)}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              t === activeTab
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-1 self-start">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTabChange?.(t)}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            t === activeTab
              ? 'bg-white text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
