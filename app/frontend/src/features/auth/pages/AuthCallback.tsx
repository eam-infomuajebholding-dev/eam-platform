import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { persistWebSdkToken, readCallbackToken } from '@/features/auth/api/auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refetch } = useAuth();

  useEffect(() => {
    async function run() {
      const token = readCallbackToken();
      if (!token || !persistWebSdkToken(token)) {
        navigate('/auth/error', { replace: true });
        return;
      }

      await refetch();
      navigate('/', { replace: true });
    }

    void run();
  }, [navigate, refetch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
