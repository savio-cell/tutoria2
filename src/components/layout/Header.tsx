
import React from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  return (
    <header className="w-full h-16 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar..." 
            className="pl-8 h-9 bg-muted/50 border-none focus-visible:ring-1" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full"></span>
        </Button>
        
        <div className="flex items-center gap-2 pl-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            A
          </div>
          <span className="text-sm font-medium">Aluno</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
};

export default Header;
