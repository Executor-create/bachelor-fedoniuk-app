import { FiSearch } from 'react-icons/fi';
import { MdAccountCircle } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

const Header = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
    <header className="flex flex-row justify-between items-center text-white px-7 py-4 bg-zinc-950 border-b border-zinc-800">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 shrink-0">
        <h1
          className="text-3xl font-google font-bold"
          style={{
            background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Klyro
        </h1>
      </Link>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8">
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
          />
        </div>
      </form>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link to="/profile">
          <MdAccountCircle
            size={38}
            className="cursor-pointer text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-200"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
