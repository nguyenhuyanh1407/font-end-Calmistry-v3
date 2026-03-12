import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import userService from '../services/userService';
import authService from '../services/authService';

/**
 * OnboardingRoute Component
 * Prevents users who have already completed onboarding from accessing the /onboarding page
 */
const OnboardingRoute = ({ children }) => {
    const token = api.getToken();

    // If no token, let them proceed (or redirect to login, depending on your auth flow)
    // Assuming they need to be logged in to access onboarding
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const { data: currentUser, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: userService.getMyInfo,
        enabled: authService.isAuthenticated(),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // If user is already onboarded, redirect to home
    if (currentUser && currentUser.isOnboarded === true) {
        return <Navigate to="/" replace />;
    }

    // If not onboarded, let them access the onboarding page
    return children;
};

export default OnboardingRoute;
