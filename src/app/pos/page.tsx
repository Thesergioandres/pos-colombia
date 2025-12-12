'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { usePosStore } from '@/stores/pos';
import PosLayout from '@/components/pos/PosLayout';
import ProductSearch from '@/components/pos/ProductSearch';
import ShoppingCart from '@/components/pos/ShoppingCart';
import PaymentPanel from '@/components/pos/PaymentPanel';
import CustomerSelector from '@/components/pos/CustomerSelector';

export default function PosPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { 
    cart, 
    customer, 
    paymentMethod, 
    cashReceived, 
    getTotal, 
    getChange,
    getItemCount 
  } = usePosStore();
  
  const [activeView, setActiveView] = useState<'products' | 'payment'>('products');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setActiveView('payment');
  };

  const handleBackToProducts = () => {
    setActiveView('products');
  };

  return (
    <PosLayout>
      <div className="flex h-full">
        {/* Panel izquierdo - Búsqueda de productos */}
        <div className="flex-1 border-r border-border bg-background">
          {activeView === 'products' ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border">
                <CustomerSelector />
              </div>
              <div className="flex-1 p-4">
                <ProductSearch />
              </div>
            </div>
          ) : (
            <div className="h-full p-4">
              <PaymentPanel 
                onBack={handleBackToProducts}
                onComplete={() => {
                  // Handle payment completion
                  setActiveView('products');
                }}
              />
            </div>
          )}
        </div>

        {/* Panel derecho - Carrito de compras */}
        <div className="w-96 bg-muted/30">
          <ShoppingCart 
            onCheckout={handleCheckout}
            isPaymentView={activeView === 'payment'}
          />
        </div>
      </div>
    </PosLayout>
  );
}