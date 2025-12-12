'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  User, 
  ShoppingCart, 
  CreditCard, 
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { usePosStore } from '@/stores/pos';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface PosLayoutProps {
  children: ReactNode;
}

export default function PosLayout({ children }: PosLayoutProps) {
  const { user, organization, logout } = useAuthStore();
  const { cart, getItemCount, getTotal } = usePosStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
                    <User className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.role}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      router.push('/reports');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Reportes
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-3">
              <Store className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-lg font-semibold">POS Colombia</h1>
                {organization && (
                  <p className="text-sm text-muted-foreground">{organization.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart summary - Mobile */}
            <div className="md:hidden">
              <Badge variant="secondary" className="text-xs">
                {getItemCount()} items
              </Badge>
            </div>

            {/* User info - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reportes
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="px-4 py-2 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span>{getItemCount()} productos</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>${getTotal().toLocaleString('es-CO', { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
            {organization && (
              <Badge variant="outline" className="text-xs">
                {organization.city || 'Sin ciudad'}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2024 POS Colombia - Facturación Electrónica DIAN</p>
          <p>Impuestos incluidos donde aplica</p>
        </div>
      </footer>
    </div>
  );
}