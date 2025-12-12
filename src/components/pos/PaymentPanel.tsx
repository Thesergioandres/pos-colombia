'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ArrowLeft,
  CreditCard,
  DollarSign,
  Smartphone,
  Building,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePosStore } from '@/stores/pos';
import { toast } from 'sonner';

interface PaymentPanelProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function PaymentPanel({ onBack, onComplete }: PaymentPanelProps) {
  const {
    cart,
    customer,
    paymentMethod,
    cashReceived,
    setPaymentMethod,
    setCashReceived,
    getTotal,
    getChange,
    setProcessing
  } = usePosStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [cardType, setCardType] = useState('');
  const [bank, setBank] = useState('');
  const [lastFourDigits, setLastFourDigits] = useState('');

  const total = getTotal();
  const change = getChange();
  const isPaymentComplete = paymentMethod === 'CASH' ? cashReceived >= total : true;

  const paymentMethods = [
    {
      value: 'CASH',
      label: 'Efectivo',
      icon: DollarSign,
      description: 'Pago en efectivo'
    },
    {
      value: 'CARD',
      label: 'Tarjeta',
      icon: CreditCard,
      description: 'Débito o Crédito'
    },
    {
      value: 'TRANSFER',
      label: 'Transferencia',
      icon: Building,
      description: 'Transferencia bancaria'
    },
    {
      value: 'NEQUI',
      label: 'Nequi',
      icon: Smartphone,
      description: 'Pago con Nequi'
    },
    {
      value: 'DAVIPLATA',
      label: 'Daviplata',
      icon: Smartphone,
      description: 'Pago con Daviplata'
    },
    {
      value: 'CREDIT',
      label: 'Crédito',
      icon: FileText,
      description: 'Venta a crédito'
    }
  ];

  const banks = [
    'Bancolombia', 'Davivienda', 'BBVA', 'Scotiabank Colpatria',
    'Banco de Bogotá', 'Banco Popular', 'Banco de Occidente',
    'Citibank', 'HSBC', 'Banco AV Villas', 'Banco Caja Social'
  ];

  const cardTypes = [
    { value: 'DEBIT', label: 'Débito' },
    { value: 'CREDIT', label: 'Crédito' },
    { value: 'PREPAID', label: 'Prepago' }
  ];

  useEffect(() => {
    if (paymentMethod === 'CASH') {
      setCashReceived(total);
    }
  }, [paymentMethod, total]);

  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method as any);
    setReferenceNumber('');
    setCardType('');
    setBank('');
    setLastFourDigits('');
  };

  const handleProcessPayment = async () => {
    if (!isPaymentComplete) {
      toast.error('El pago no está completo');
      return;
    }

    if (paymentMethod === 'CARD' && (!cardType || !bank || !lastFourDigits)) {
      toast.error('Por favor completa todos los datos de la tarjeta');
      return;
    }

    if ((paymentMethod === 'TRANSFER' || paymentMethod === 'NEQUI' || paymentMethod === 'DAVIPLATA') && !referenceNumber) {
      toast.error('Por favor ingresa el número de referencia');
      return;
    }

    if (paymentMethod === 'CREDIT' && !customer) {
      toast.error('Para venta a crédito se requiere un cliente');
      return;
    }

    setIsProcessing(true);
    setProcessing(true);

    try {
      const paymentData = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.salePrice,
          totalPrice: item.product.salePrice * item.quantity,
          discount: item.discount
        })),
        customerId: customer?.id || null,
        paymentMethod,
        subtotal: total,
        iva: 0, // Calculate this based on items
        total,
        discount: 0, // Global discount
        cashReceived: paymentMethod === 'CASH' ? cashReceived : 0,
        change: paymentMethod === 'CASH' ? change : 0,
        paymentDetails: {
          referenceNumber,
          cardType,
          bank,
          lastFourDigits
        }
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const sale = await response.json();
        toast.success('¡Venta procesada exitosamente!');
        onComplete();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al procesar la venta');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
  };

  const getPaymentIcon = (method: string) => {
    const paymentMethod = paymentMethods.find(m => m.value === method);
    return paymentMethod ? paymentMethod.icon : CreditCard;
  };

  const PaymentIcon = getPaymentIcon(paymentMethod);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Procesar Pago</h2>
          <p className="text-muted-foreground">Total a pagar: {formatPrice(total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Payment methods */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PaymentIcon className="h-5 w-5" />
                <span>Método de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.value} className="space-y-2">
                        <RadioGroupItem
                          value={method.value}
                          id={method.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={method.value}
                          className="flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted/50 transition-colors"
                        >
                          <Icon className="h-6 w-6 mb-1" />
                          <span className="text-sm font-medium">{method.label}</span>
                          <span className="text-xs text-muted-foreground text-center">
                            {method.description}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment details */}
          {paymentMethod === 'CASH' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles de Efectivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cashReceived">Efectivo recibido</Label>
                  <Input
                    id="cashReceived"
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                {change > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Cambio: {formatPrice(change)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'CARD' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles de Tarjeta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de tarjeta</Label>
                    <Select value={cardType} onValueChange={setCardType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {cardTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Banco</Label>
                    <Select value={bank} onValueChange={setBank}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map(bank => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Últimos 4 dígitos</Label>
                  <Input
                    value={lastFourDigits}
                    onChange={(e) => setLastFourDigits(e.target.value)}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {(paymentMethod === 'TRANSFER' || paymentMethod === 'NEQUI' || paymentMethod === 'DAVIPLATA') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {paymentMethod === 'TRANSFER' ? 'Datos de Transferencia' : 'Número de Referencia'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="reference">
                    {paymentMethod === 'TRANSFER' ? 'Número de referencia' : 'Referencia'}
                  </Label>
                  <Input
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="000000000"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === 'CREDIT' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Venta a Crédito</CardTitle>
              </CardHeader>
              <CardContent>
                {customer ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-700">Cliente seleccionado:</p>
                      <p className="text-blue-600">{customer.name}</p>
                      {customer.creditLimit && (
                        <p className="text-sm text-blue-600">
                          Límite de crédito: {formatPrice(customer.creditLimit)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-700">
                      <AlertCircle className="h-5 w-5" />
                      <span>Debes seleccionar un cliente para ventas a crédito</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order items */}
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{item.quantity}x</span>
                      <span className="ml-2">{item.product.name}</span>
                    </div>
                    <span>{formatPrice(item.product.salePrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>Incluido</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {paymentMethod === 'CASH' && change > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Cambio: {formatPrice(change)}</span>
                  </div>
                </div>
              )}

              {!isPaymentComplete && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {paymentMethod === 'CASH' 
                        ? 'El efectivo recibido es insuficiente'
                        : 'Completa los datos requeridos'
                      }
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Process payment button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="lg" 
                className="w-full"
                disabled={!isPaymentComplete || isProcessing}
              >
                {isProcessing ? (
                  'Procesando...'
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Procesar Pago
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Pago</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de procesar este pago por {formatPrice(total)}?
                  {paymentMethod === 'CASH' && change > 0 && (
                    <span> El cambio será {formatPrice(change)}.</span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleProcessPayment}>
                  Confirmar Pago
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}