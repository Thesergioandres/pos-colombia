'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Package, 
  Barcode, 
  Eye,
  Plus,
  AlertCircle
} from 'lucide-react';
import { usePosStore } from '@/stores/pos';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  salePrice: number;
  stock: number;
  iva: number;
  includesIva: boolean;
  category?: {
    id: string;
    name: string;
  };
}

export default function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart, cart } = usePosStore();

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Error al buscar productos');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAddToCart = (product: Product) => {
    const cartItem = cart.find(item => item.product.id === product.id);
    const currentQuantity = cartItem?.quantity || 0;
    
    if (currentQuantity >= product.stock) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleBarcodeSearch = () => {
    // Simular escaneo de código de barras
    const simulatedBarcode = '7701234567890';
    setSearchTerm(simulatedBarcode);
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.product.id === productId);
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código o escanear..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            onClick={handleBarcodeSearch}
          >
            <Barcode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 && searchTerm ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : products.length === 0 && !searchTerm ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Ingresa un término de búsqueda</p>
              <p className="text-sm text-muted-foreground mt-1">
                o escanea un código de barras
              </p>
            </div>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        {product.stock <= 5 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Bajo stock
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        {product.sku && (
                          <span>SKU: {product.sku}</span>
                        )}
                        {product.category && (
                          <Badge variant="outline" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-lg text-primary">
                            {formatPrice(product.salePrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {product.stock} unidades
                          </p>
                          {product.iva > 0 && (
                            <p className="text-xs text-muted-foreground">
                              IVA: {product.iva}% {product.includesIva ? '(incluido)' : '(adicionado)'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {isInCart(product.id) && (
                            <Badge variant="secondary" className="text-xs">
                              {getCartQuantity(product.id)} en carrito
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}