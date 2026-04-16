import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { DashboardOverview } from './pages/DashboardOverview';
import { Universities } from './pages/Universities';
import { Scholarships } from './pages/Scholarships';
import { Timeline } from './pages/Timeline';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Auth,
  },
  {
    path: '/signup',
    Component: Auth,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardOverview },
      { path: 'universities', Component: Universities },
      { path: 'scholarships', Component: Scholarships },
      { path: 'timeline', Component: Timeline },
      { path: 'settings', Component: Settings },
    ],
  },
]);
