import { NavLink } from 'react-router-dom';

const SidebarItem = ({
  name,
  href,
  icon: Icon,
  collapsed = false,
  labelsVisible = true,
}: {
  name: string;
  href?: string;
  icon: React.ComponentType<{ size: number }>;
  collapsed?: boolean;
  labelsVisible?: boolean;
}) => {
  const baseClass = `
    font-google text-sm font-medium
    flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer
    ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
  `;

  const inactiveClass = 'text-zinc-400 hover:text-white hover:bg-zinc-800';
  const activeClass = 'text-violet-400 bg-violet-600/10 hover:bg-violet-600/15';

  const content = (
    <>
      <Icon size={18} />
      {labelsVisible && (
        <span
          className={`
            whitespace-nowrap overflow-hidden transition-opacity duration-200
            ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}
          `}
        >
          {name}
        </span>
      )}
    </>
  );

  return (
    <li className="relative mb-0.5 group">
      {href && href.startsWith('/') ? (
        <NavLink
          to={href}
          end={href === '/'}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          {content}
        </NavLink>
      ) : (
        <a href={href} className={`${baseClass} ${inactiveClass}`}>
          {content}
        </a>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div
          className="
            pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50
            px-2.5 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold
            bg-zinc-900 border border-zinc-700 text-white shadow-xl
            opacity-0 translate-x-1
            group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-150
          "
        >
          {name}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-700" />
        </div>
      )}
    </li>
  );
};

export default SidebarItem;
