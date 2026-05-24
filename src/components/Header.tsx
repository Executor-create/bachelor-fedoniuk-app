import { FiSearch, FiMenu } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

const UserAvatar = () => {
  const { user } = useAuth();

  const avatarUrl = user?.profile?.avatar_url ?? user?.avatar_url ?? null;
  const displayName =
    user?.profile?.display_name ?? user?.display_name ?? user?.username ?? '';
  const initial = displayName.trim()[0]?.toUpperCase() ?? 'U';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className="w-9 h-9 rounded-xl object-cover bg-zinc-800 border border-zinc-700"
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-sm font-semibold">
      {initial}
    </div>
  );
};

const Header = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toggleMobile } = useSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-row justify-between items-center text-white px-4 lg:px-7 py-4 bg-zinc-950 border-b border-zinc-800"
    >
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Open navigation"
        >
          <FiMenu size={20} />
        </button>
        <Link to="/">
          <motion.h1
            className="text-3xl font-google font-bold animate-logo-glow"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Klyro
          </motion.h1>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="hidden sm:block flex-1 max-w-lg mx-4 lg:mx-8"
      >
        <div className="relative">
          <FiSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search games, users..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
          />
        </div>
      </form>

      {/* Right: avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/profile">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <UserAvatar />
          </motion.div>
        </Link>
      </div>
    </motion.header>
  );
};

export default Header;
