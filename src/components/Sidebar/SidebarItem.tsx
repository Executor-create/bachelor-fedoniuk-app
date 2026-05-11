import { Link } from 'react-router-dom';

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
  return (
    <li className="relative mb-1 group">
      {href && href.startsWith('/') ? (
        <Link
          to={href}
          className={`
            font-google text-sm font-bold
            hover:text-white hover:bg-(--primary-color) hover:rounded-md
            flex items-center gap-2 transition-all duration-200 cursor-pointer
            ${collapsed ? 'justify-center p-3' : 'p-2'}
          `}
        >
          <Icon size={20} />

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
        </Link>
      ) : (
        <a
          href={href}
          className={`
            font-google text-sm font-bold
            hover:text-white hover:bg-(--primary-color) hover:rounded-md
            flex items-center gap-2 transition-all duration-200 cursor-pointer
            ${collapsed ? 'justify-center p-3' : 'p-2'}
          `}
        >
          <Icon size={20} />

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
        </a>
      )}

      {/* tooltip on hover when collapsed */}
      {collapsed && (
        <div
          className="
            pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50
            px-2.5 py-1.5 rounded-md whitespace-nowrap text-xs font-bold
            bg-gray-800 border border-gray-600 text-white shadow-xl
            opacity-0 translate-x-1
            group-hover:opacity-100 group-hover:translate-x-0
            transition-all duration-150
          "
        >
          {name}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-600" />
        </div>
      )}
    </li>
  );
};

export default SidebarItem;
