import { createContext, useContext, useState } from 'react';

type SidebarContextType = {
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
});

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
        toggleMobile: () => setMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
