import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import { Profile } from '../pages/Profile';
import RequireAuth from '../components/RequireAuth';
import OTP from '../pages/OTP';
import ForgotPasswordPage from '../pages/ForgotPassword';
import ResetPasswordPage from '../pages/ResetPassword';
import { GamesPage } from '../pages/Games';
import Collections from '../pages/Collections';
import CollectionDetail from '../pages/CollectionDetail';
import GameDetail from '../pages/GameDetail';
import PostDetail from '../pages/PostDetail';
import Search from '../pages/Search';
import TrendingPage from '../pages/Trending';
import Recommendations from '../pages/Recommendations';
import Chat from '../pages/Chat';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/otp',
    element: <OTP />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/games',
    element: <GamesPage />,
  },
  {
    path: '/games/:id',
    element: <GameDetail />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: 'collections',
        element: <Collections />,
      },
      {
        path: 'collections/:id',
        element: <CollectionDetail />,
      },
      {
        path: 'posts/:id',
        element: <PostDetail />,
      },
      {
        path: 'search',
        element: <Search />,
      },
      {
        path: 'trending',
        element: <TrendingPage />,
      },
      {
        path: 'recommendations',
        element: <Recommendations />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'profile/:id',
        element: <Profile />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
    ],
  },
]);

export default router;
