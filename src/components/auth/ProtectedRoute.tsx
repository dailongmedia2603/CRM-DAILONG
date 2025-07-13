import { useAuth } from '@/context/AuthProvider';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAbility } from '@/context/AbilityProvider';
import { useEffect } from 'react';

const permissionRouteMap = [
    { permission: 'dashboard.view', path: '/' },
    { permission: 'clients.view', path: '/clients' },
    { permission: 'projects.view', path: '/projects' },
    { permission: 'leads.view', path: '/sales/leads' },
    { permission: 'intern_tasks.view', path: '/interns' },
    { permission: 'tasks.view', path: '/task-management' },
    { permission: 'reports.view', path: '/reports' },
    { permission: 'hr.view', path: '/hr' },
];

const ProtectedRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const { can, loading: abilityLoading } = useAbility();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || abilityLoading) {
      return; // Chờ cho đến khi tất cả dữ liệu được tải xong
    }

    if (session) {
      // Logic này chạy khi người dùng đã đăng nhập và tất cả dữ liệu đã được tải.
      // Nó kiểm tra xem người dùng có đang ở trang gốc không và có nên chuyển hướng họ không.
      if (location.pathname === '/') {
        const canAccessDashboard = can('dashboard.view');
        if (!canAccessDashboard) {
          const defaultRoute = permissionRouteMap.find(route => can(route.permission))?.path;
          if (defaultRoute && defaultRoute !== '/') {
            navigate(defaultRoute, { replace: true });
          } else if (!defaultRoute) {
            // Trường hợp này có nghĩa là người dùng không có quyền nào cả.
            navigate('/no-access', { replace: true });
          }
        }
      }
    }
  }, [authLoading, abilityLoading, session, location.pathname, can, navigate]);

  if (authLoading || abilityLoading) {
    return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;