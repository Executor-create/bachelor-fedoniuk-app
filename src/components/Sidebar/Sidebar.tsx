import {
  FiHome,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiUser,
  FiMessageSquare,
  FiFolder,
  FiSearch,
  FiAward,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { LuGamepad2 } from 'react-icons/lu';
import { useEffect, useRef, useState } from 'react';
import SidebarItem from './SidebarItem';
import { removeItemFromLocalStorage } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { logout as apiLogout } from '../../api/auth';

const items = [
  { name: 'Home Feed', href: '/', icon: FiHome },
  { name: 'Search', href: '/search', icon: FiSearch },
  { name: 'Browse Games', href: '/games', icon: LuGamepad2 },
  { name: 'Recommendations', href: '#', icon: FiStar },
  { name: 'Trending', href: '#', icon: FiTrendingUp },
  { name: 'Community', href: '#', icon: FiUsers },
  { name: 'Friends', href: '#', icon: FiUser },
  { name: 'Messages', href: '#', icon: FiMessageSquare },
  { name: 'Collections', href: '/collections', icon: FiFolder },
  { name: 'Leaderboards', href: '#', icon: FiAward },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      setCollapsed(true);
      setLabelsVisible(false);
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', String(next));
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (next) {
        fadeTimer.current = setTimeout(() => setLabelsVisible(false), 200);
      } else {
        setLabelsVisible(true);
      }
      return next;
    });
  };

  return (
    // Outer: controls width, `relative` for the toggle button — NO overflow here
    <div
      className="relative shrink-0 h-[calc(100vh-76px)] transition-[width] duration-300 ease-in-out"
      style={{ width: collapsed ? '4.5rem' : '17rem' }}
    >
      {/* Inner: the actual scrollable sidebar — overflow lives here */}
      <div className="h-full w-full bg-(--third-color) text-white flex flex-col border-r border-gray-700 overflow-y-auto scrollbar-hide p-3">
        <ul>
          {items.map((item) => (
            <SidebarItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              collapsed={collapsed}
              labelsVisible={labelsVisible}
            />
          ))}
        </ul>

        <div className="mt-auto border-t border-gray-600 pt-3">
          <ul>
            <SidebarItem
              name="Settings"
              href="#"
              icon={FiSettings}
              collapsed={collapsed}
              labelsVisible={labelsVisible}
            />
            <button
              className="w-full"
              onClick={async () => {
                try {
                  await apiLogout();
                } catch (err) {
                  // ignore API errors
                } finally {
                  removeItemFromLocalStorage('token');
                  removeItemFromLocalStorage('refreshToken');
                  navigate('/login');
                }
              }}
            >
              <SidebarItem
                name="Logout"
                icon={FiLogOut}
                collapsed={collapsed}
                labelsVisible={labelsVisible}
              />
            </button>
          </ul>
        </div>
      </div>
      <button
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="
          absolute bottom-33 right-0 translate-x-1/2 z-20
          flex items-center justify-center
          w-5 h-9 rounded-full
          bg-(--third-color) border border-gray-700
          text-gray-300 shadow-md
          hover:bg-gray-600 hover:text-white hover:scale-110
          transition-all duration-150
        "
      >
        {collapsed ? <FiChevronRight size={13} /> : <FiChevronLeft size={13} />}
      </button>
    </div>
  );
};

export default Sidebar;
