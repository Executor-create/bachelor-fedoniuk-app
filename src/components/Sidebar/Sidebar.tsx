import {
  FiHome,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiMessageSquare,
  FiFolder,
  FiSearch,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from 'react-icons/fi';
import { LuGamepad2 } from 'react-icons/lu';
import { useEffect, useRef, useState } from 'react';
import SidebarItem from './SidebarItem';
import { removeItemFromLocalStorage } from '../../utils/localStorage';
import { Link, useNavigate } from 'react-router-dom';
import { logout as apiLogout } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { hasPremiumAccess } from '../../utils/subscriptionUtils';
import { useSidebar } from '../../contexts/SidebarContext';

const items = [
  { name: 'Home Feed', href: '/', icon: FiHome },
  { name: 'Search', href: '/search', icon: FiSearch },
  { name: 'Browse Games', href: '/games', icon: LuGamepad2 },
  { name: 'Recommendations', href: '/recommendations', icon: FiStar },
  { name: 'Trending', href: '/trending', icon: FiTrendingUp },
  { name: 'Messages', href: '/chat', icon: FiMessageSquare },
  { name: 'Collections', href: '/collections', icon: FiFolder },
];

const SidebarInner = ({
  collapsed,
  labelsVisible,
  onClose,
}: {
  collapsed: boolean;
  labelsVisible: boolean;
  onClose?: () => void;
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPremium = hasPremiumAccess(user);

  return (
    <div className="h-full w-full bg-zinc-950 text-white flex flex-col border-r border-zinc-800 overflow-y-auto scrollbar-hide p-3">
      {onClose && (
        <div className="flex justify-end mb-2 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      <ul>
        {items.map((item) => (
          <SidebarItem
            key={item.name}
            name={item.name}
            href={item.href}
            icon={item.icon}
            collapsed={collapsed}
            labelsVisible={labelsVisible}
            onNavigate={onClose}
          />
        ))}
        {!isPremium ? (
          <SidebarItem
            name="Upgrade"
            href="/upgrade"
            icon={FiStar}
            collapsed={collapsed}
            labelsVisible={labelsVisible}
            onNavigate={onClose}
          />
        ) : (
          <li className="relative mb-0.5">
            <Link
              to="/upgrade"
              onClick={onClose}
              aria-label="Manage premium plan"
              className={`font-google text-xs font-semibold uppercase tracking-[0.2em] flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-600/10 text-violet-200 transition hover:border-violet-400/50 hover:text-white ${
                collapsed ? 'justify-center p-3' : 'px-3 py-2.5'
              }`}
            >
              <FiStar size={16} className="text-violet-300" />
              {labelsVisible && (
                <span
                  className={`whitespace-nowrap overflow-hidden transition-opacity duration-200 ${
                    collapsed ? 'opacity-0 w-0' : 'opacity-100'
                  }`}
                >
                  Premium
                </span>
              )}
            </Link>
          </li>
        )}
      </ul>

      <div className="mt-auto border-t border-zinc-800 pt-3">
        <ul>
          <SidebarItem
            name="Profile"
            href="/profile"
            icon={FiUser}
            collapsed={collapsed}
            labelsVisible={labelsVisible}
            onNavigate={onClose}
          />
          <SidebarItem
            name="Settings"
            href="/settings"
            icon={FiSettings}
            collapsed={collapsed}
            labelsVisible={labelsVisible}
            onNavigate={onClose}
          />
          <button
            className="w-full"
            onClick={async () => {
              onClose?.();
              try {
                await apiLogout();
              } catch (err) {
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
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mobileOpen, closeMobile } = useSidebar();

  useEffect(() => {
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      setCollapsed(true);
      setLabelsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (mobileOpen) closeMobile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 z-40 h-full w-72 transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarInner
          collapsed={false}
          labelsVisible={true}
          onClose={closeMobile}
        />
      </div>

      <div
        className="relative shrink-0 h-[calc(100vh-76px)] transition-[width] duration-300 ease-in-out hidden lg:block"
        style={{ width: collapsed ? '4.5rem' : '17rem' }}
      >
        <SidebarInner collapsed={collapsed} labelsVisible={labelsVisible} />

        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="
            absolute -translate-y-1/2 right-0 bottom-50 translate-x-1/2 z-20
            flex items-center justify-center
            w-5 h-9 rounded-full
            bg-zinc-900 border border-zinc-800
            text-zinc-400 shadow-md
            hover:bg-zinc-800 hover:border-zinc-700 hover:text-white hover:scale-110
            transition-all duration-150
          "
        >
          {collapsed ? (
            <FiChevronRight size={13} />
          ) : (
            <FiChevronLeft size={13} />
          )}
        </button>
      </div>
    </>
  );
};

export default Sidebar;
