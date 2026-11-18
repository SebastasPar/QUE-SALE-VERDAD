import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, hasCompletedOnboarding } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAuthRoute = location.pathname.startsWith('/auth') || location.pathname === '/';

    if (!token) {
      if (!isAuthRoute) {
        navigate('/', { replace: true });
      }
      return;
    }

    if (user?.role === 'venue') {
      const isVenueForbidden =
        isAuthRoute ||
        location.pathname === '/onboarding' ||
        location.pathname === '/feed' ||
        location.pathname === '/recharge';

      if (isVenueForbidden) {
        navigate('/venue/dashboard', { replace: true });
      }
      return;
    }

    // Standard personal user routing
    if (location.pathname.startsWith('/venue')) {
      navigate('/feed', { replace: true });
      return;
    }

    if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
      // User is authenticated but hasn't completed onboarding
      navigate('/onboarding', { replace: true });
    } else if (hasCompletedOnboarding && (isAuthRoute || location.pathname === '/onboarding')) {
      // User is fully authenticated and trying to access auth/onboarding routes
      navigate('/feed', { replace: true });
    }
    // If none of these match, let the current route render normally
  }, [token, user?.role, hasCompletedOnboarding, location.pathname, navigate]);

  return <>{children}</>;
};
