import * as React from 'react';

const tabs = ['Favorite Games', 'Activity', 'Reviews'];

type ProfileTabsProps = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
};

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab = 'Favorite Games',
  onTabChange,
}) => {
  return (
    <div className="mx-6 mt-6">
      <div className="flex items-center gap-3">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onTabChange?.(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              t === activeTab
                ? 'bg-(--third-color) text-white border border-gray-700'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;
