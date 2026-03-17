import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import userService from '../services/userService';

const isGoldUser = (me) => {
  const roles = Array.isArray(me?.roles) ? me.roles : Array.from(me?.roles || []);
  const hasGoldRole = roles.some((r) =>
    ['ADMIN', 'EXPERT', 'ROLE_ADMIN', 'ROLE_EXPERT'].includes(String(r).toUpperCase())
  );
  if (hasGoldRole) return true;
  return String(me?.plan || '').toUpperCase() === 'GOLD';
};

const PlanRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const authKey = token ? token.slice(-16) : 'anon';
  const meStorageKey = `me:${authKey}`;

  const { data: me, isLoading } = useQuery({
    queryKey: ['me', authKey],
    queryFn: userService.getMyInfo,
    enabled: Boolean(token),
    initialData: () => {
      try {
        const raw = localStorage.getItem(meStorageKey);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    }
  });

  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (isLoading) return null;

  if (!isGoldUser(me)) {
    return <Navigate to="/checkout?plan=gold" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default PlanRoute;

