
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  BarChart2, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  Settings,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/profile', label: 'Meu Perfil', icon: User },
  { path: '/progress', label: 'Progresso', icon: BarChart2 },
  { path: '/quiz', label: 'Quiz', icon: HelpCircle },
  { path: '/chat-ai', label: 'Assistente IA', icon: MessageSquare },
  { path: '/essay', label: 'Redação', icon: FileText },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

const SidebarContent = ({ collapsed, setCollapsed, isMobile, closeMobileMenu }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  
  // Fetch user info
  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        try {
          const { data, error } = await supabase
            .from('user_info')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user info:', error);
            return;
          }
          
          setUserInfo(data);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      
      fetchUserInfo();
    }
  }, [user]);
  
  // Get user display name
  const getUserDisplayName = () => {
    if (userInfo?.full_name) {
      return userInfo.full_name;
    } else if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    } else if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    } else {
      return 'Estudante';
    }
  };

  const getEmailDisplay = () => {
    return user?.email || userInfo?.email || '';
  };
  
  const handleNavClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  return (
    <>
      <div className="flex items-center h-16 px-4 border-b border-border">
        <div className={cn("flex items-center gap-2 transition-opacity", collapsed && !isMobile && "opacity-0")}>
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold">IA</span>
          </div>
          <h1 className="font-semibold text-lg">TutorIA</h1>
        </div>
        {isMobile ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={closeMobileMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>
      
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && !isMobile && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", collapsed && !isMobile && "mx-auto")} />
                {(!collapsed || isMobile) && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn(
        "p-4 border-t border-border flex items-center gap-3",
        collapsed && !isMobile ? "justify-center" : ""
      )}>
        <div className="rounded-full bg-sidebar-accent h-9 w-9 flex items-center justify-center">
          <User className="h-5 w-5 text-sidebar-accent-foreground" />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <p className="font-medium text-sm truncate max-w-[180px]">{getUserDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{getEmailDisplay()}</p>
          </div>
        )}
      </div>
    </>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // Efeito para fechar o menu quando a tela muda de tamanho
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  // Para dispositivos móveis, renderizamos um botão hamburger e um drawer
  if (isMobile) {
    return (
      <>
        <div className="h-16 sticky top-0 z-30 w-full flex items-center px-4 border-b border-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">IA</span>
            </div>
            <h1 className="font-semibold text-lg">TutorIA</h1>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Drawer para navegação móvel */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40">
            <div className="fixed top-0 left-0 h-full w-64 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 z-50 shadow-lg">
              <SidebarContent 
                collapsed={false} 
                setCollapsed={setCollapsed} 
                isMobile={true} 
                closeMobileMenu={closeMobileMenu} 
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Para desktop, renderizamos a sidebar normal
  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 z-30 flex flex-col border-r border-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <SidebarContent 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        isMobile={false} 
        closeMobileMenu={() => {}} 
      />
    </aside>
  );
};

export default Sidebar;
