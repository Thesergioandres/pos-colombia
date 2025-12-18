'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart as ShoppingCartIcon,
  CreditCard,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { usePosStore } from '@/stores/pos';
import { toast } from 'sonner';

interface ShoppingCartProps {
  onCheckout: () => void;
  isPaymentView: boolean;
}

export default function ShoppingCart({ onCheckout, isPaymentView }: ShoppingCartProps) {
  const {
    cart,
    customer,
    discount,
    notes,
    removeFromCart,
    updateQuantity,
    updateDiscount,
    clearCart,
    setDiscount,
    setNotes,
    getSubtotal,
    getIva,
    getTotal,
    getItemCount
  } = usePosStore();

  const [itemDiscounts, setItemDiscounts] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleItemDiscountChange = (productId: string, discountValue: number) => {
    setItemDiscounts(prev => ({ ...prev, [productId]: discountValue }));
    updateDiscount(productId, discountValue);
  };

  const handleClearCart = () => {
    clearCart();
    setItemDiscounts({});
    toast.success('Carrito vaciado');
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
  };

  const subtotal = getSubtotal();
  const iva = getIva();
  const globalDiscountAmount = subtotal * (discount / 100);
  const total = getTotal();

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Carrito de Compras</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">El carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Agrega productos para comenzar
            </p>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Carrito</span>
            <Badge variant="secondary">{getItemCount()}</Badge>
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Vaciar carrito?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todos los productos del carrito.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCart}>
                  Vaciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      {/* Cart items */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {cart.map((item) => (
              <Card key={item.product.id} className="p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.salePrice)} c/u
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(item.product.salePrice * item.quantity)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-xs text-green-600">
                          -{item.discount}% desc
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Item discount */}
                  <div className="flex items-center space-x-2">
                    <Label className="text-xs">Descuento:</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={itemDiscounts[item.product.id] || item.discount}
                      onChange={(e) => handleItemDiscountChange(item.product.id, Number(e.target.value))}
                      className="h-8 text-xs"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Order details */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Customer info */}
          {customer && (
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs font-medium">Cliente:</p>
              <p className="text-sm">{customer.name}</p>
              {customer.documentNumber && (
                <p className="text-xs text-muted-foreground">
                  {customer.documentType}: {customer.documentNumber}
                </p>
              )}
            </div>
          )}

          {/* Global discount */}
          <div className="flex items-center space-x-2">
            <Label className="text-xs">Descuento general:</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="h-8 text-xs"
              placeholder="0"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs">Notas:</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas de la venta..."
              className="min-h-[60px] text-xs resize-none"
            />
          </div>

          {/* Price breakdown */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {globalDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento:</span>
                <span>-{formatPrice(globalDiscountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>IVA:</span>
              <span>{formatPrice(iva)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout button */}
          {!isPaymentView && (
            <Button 
              onClick={onCheckout}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceder al pago
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}