import { lazy, Suspense, LazyExoticComponent, ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';
import { NewUserRedirect } from '../components/auth/NewUserRedirect';

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Extended lazy component type
type LazyComponent = LazyExoticComponent<ComponentType<any>> & {
  preload?: () => Promise<any>;
};

// Lazy load components with prefetching
const lazyWithPrefetch = (importFn: () => Promise<any>): LazyComponent => {
  const Component = lazy(importFn);
  (Component as LazyComponent).preload = importFn;
  return Component as LazyComponent;
};

// Public pages
const Home = lazyWithPrefetch(() => import('../pages/Home'));
const About = lazyWithPrefetch(() => import('../pages/About'));
const Help = lazyWithPrefetch(() => import('../pages/Help'));
const NotFound = lazyWithPrefetch(() => import('../pages/NotFound'));
const SignUp = lazyWithPrefetch(() => import('../pages/SignUp'));

// Protected pages
const Studio = lazyWithPrefetch(() => import('../pages/Studio'));
const VoiceCloning = lazyWithPrefetch(() => import('../pages/VoiceCloning'));
const FileManagement = lazyWithPrefetch(() => import('../pages/FileManagement'));
const Settings = lazyWithPrefetch(() => import('../pages/Settings'));
const Notifications = lazyWithPrefetch(() => import('../pages/Notifications'));

// Admin pages
const Admin = lazyWithPrefetch(() => import('../pages/Admin'));

// Route configuration
export const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: <Suspense fallback={<LoadingFallback />}><Home /></Suspense>
  },
  {
    path: '/sign-up',
    element: <Suspense fallback={<LoadingFallback />}><SignUp /></Suspense>,
    children: [
      // Handle OAuth continue route
      {
        path: 'continue',
        element: <NewUserRedirect />
      }
    ]
  },
  {
    path: '/about',
    element: <Suspense fallback={<LoadingFallback />}><About /></Suspense>
  },
  {
    path: '/help',
    element: <Suspense fallback={<LoadingFallback />}><Help /></Suspense>
  },
  {
    path: '/welcome',
    element: <NewUserRedirect />
  },

  // Protected routes
  {
    path: '/studio',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Studio />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/voice-cloning',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <VoiceCloning />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/files',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <FileManagement />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Settings />
        </Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Notifications />
        </Suspense>
      </ProtectedRoute>
    )
  },

  // Admin routes
  {
    path: '/admin/*',
    element: (
      <AdminRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Admin />
        </Suspense>
      </AdminRoute>
    )
  },

  // 404 route
  {
    path: '*',
    element: <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>
  }
];

// Helper function to safely preload a component
const safePreload = async (component: LazyComponent) => {
  try {
    await component.preload?.();
  } catch (error) {
    console.error(`Failed to preload component:`, error);
  }
};

// Prefetch routes based on user role and permissions
export const prefetchRoutes = async (isAdmin: boolean = false) => {
  // Always prefetch public routes
  await Promise.all([
    safePreload(Home),
    safePreload(About),
    safePreload(Help)
  ]);

  // Prefetch protected routes if user is authenticated
  await Promise.all([
    safePreload(Studio),
    safePreload(Settings),
    safePreload(Notifications)
  ]);

  // Prefetch admin routes if user is admin
  if (isAdmin) {
    await safePreload(Admin);
  }
};

// Prefetch routes based on current route
export const prefetchRelatedRoutes = async (currentPath: string) => {
  switch (currentPath) {
    case '/':
      // Prefetch likely next routes from home
      await Promise.all([
        safePreload(Studio),
        safePreload(About)
      ]);
      break;
    case '/studio':
      // Prefetch related routes
      await Promise.all([
        safePreload(VoiceCloning),
        safePreload(FileManagement)
      ]);
      break;
    case '/voice-cloning':
      // Prefetch related routes
      await safePreload(FileManagement);
      break;
    case '/files':
      // Prefetch related routes
      await safePreload(Studio);
      break;
    case '/settings':
      // Prefetch related routes
      await safePreload(Notifications);
      break;
    case '/admin':
      // Prefetch all admin-related routes
      break;
  }
};
