import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDevEditModeEnabled, useEditMode } from '@/contexts/EditModeContext';

/**
 * Dev-only: /admin activates inline edit mode and redirects home.
 * Production admin auth is not implemented here.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isEditMode, toggleEditMode } = useEditMode();

  useEffect(() => {
    if (isDevEditModeEnabled && !isEditMode) {
      toggleEditMode();
    }
    navigate('/', { replace: true });
  }, [isEditMode, toggleEditMode, navigate]);

  return null;
}
