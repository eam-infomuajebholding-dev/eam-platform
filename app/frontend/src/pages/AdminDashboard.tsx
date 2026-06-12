import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditMode } from '@/contexts/EditModeContext';

/**
 * The /admin route now simply activates edit mode and redirects to the homepage.
 * The inline edit mode overlay replaces the old dashboard.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, toggleEditMode } = useEditMode();

  useEffect(() => {
    if (isAuthenticated) {
      toggleEditMode();
    }
    navigate('/', { replace: true });
  }, [isAuthenticated, toggleEditMode, navigate]);

  return null;
}