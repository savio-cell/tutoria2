
import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto max-h-screen">
        <div className="mb-4 md:mb-6 flex justify-end">
          {user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 micro-bounce"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Sair</span>
            </Button>
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
