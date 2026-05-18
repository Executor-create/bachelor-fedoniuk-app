import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Profile = lazy(() =>
  import('../pages/Profile').then((module) => ({ default: module.Profile })),
);
const OTP = lazy(() => import('../pages/OTP'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPassword'));
const GamesPage = lazy(() =>
  import('../pages/Games').then((module) => ({ default: module.GamesPage })),
);
const Collections = lazy(() => import('../pages/Collections'));
const CollectionDetail = lazy(() => import('../pages/CollectionDetail'));
const GameDetail = lazy(() => import('../pages/GameDetail'));
const PostDetail = lazy(() => import('../pages/PostDetail'));
const Search = lazy(() => import('../pages/Search'));
const TrendingPage = lazy(() => import('../pages/Trending'));
const Recommendations = lazy(() => import('../pages/Recommendations'));
const Chat = lazy(() => import('../pages/Chat'));
const Upgrade = lazy(() => import('../pages/Upgrade'));
const Settings = lazy(() => import('../pages/Settings'));

const router = createBrowserRouter(
  [
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
        {
          path: 'upgrade',
          element: <Upgrade />,
        },
        {
          path: 'settings',
          element: <Settings />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.PROD ? '/klyro-app' : '/',
  },
);

export default router;
