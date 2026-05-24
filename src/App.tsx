import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import './index.css';

const FullScreenLoader = () => (
  <div className="bg-zinc-950 h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      <p className="text-zinc-500 text-sm">Loading…</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Suspense fallback={<FullScreenLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
