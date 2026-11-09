import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, hasCompletedOnboarding } = useAuthStore();
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

    if (token && !hasCompletedOnboarding && location.pathname !== '/onboarding') {
      // User is authenticated but hasn't completed onboarding
      navigate('/onboarding', { replace: true });
    } else if (token && hasCompletedOnboarding && (isAuthRoute || location.pathname === '/onboarding')) {
      // User is fully authenticated and trying to access auth/onboarding routes
      navigate('/feed', { replace: true });
    }
    // If none of these match, let the current route render normally
  }, [token, hasCompletedOnboarding, location.pathname, navigate]);

  return <>{children}</>;
};
