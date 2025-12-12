'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Search, 
  Plus,
  Users,
  CreditCard,
  FileText
} from 'lucide-react';
import { usePosStore } from '@/stores/pos';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  creditLimit?: number;
  currentDebt?: number;
  city?: string;
  department?: string;
}

export default function CustomerSelector() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    documentType: 'CC',
    documentNumber: '',
    city: '',
    department: ''
  });
  
  const { customer, setCustomer } = usePosStore();

  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      } else {
        toast.error('Error al buscar clientes');
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      toast.error('Error al buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectCustomer = (customer: Customer) => {
    setCustomer(customer);
    setSearchTerm('');
    setCustomers([]);
    setIsDialogOpen(false);
    toast.success(`Cliente seleccionado: ${customer.name}`);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error('El nombre del cliente es requerido');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const createdCustomer = await response.json();
        setCustomer(createdCustomer);
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          documentType: 'CC',
          documentNumber: '',
          city: '',
          department: ''
        });
        setIsDialogOpen(false);
        toast.success('Cliente creado exitosamente');
      } else {
        toast.error('Error al crear cliente');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Error al crear cliente');
    }
  };

  const handleRemoveCustomer = () => {
    setCustomer(null);
    toast.success('Cliente removido');
  };

  const documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'NIT', label: 'NIT' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PPT', label: 'Pasaporte' }
  ];

  return (
    <div className="space-y-3">
      {customer ? (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{customer.name}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {customer.documentNumber && (
                  <span>{customer.documentType}: {customer.documentNumber}</span>
                )}
                {customer.phone && (
                  <span>• {customer.phone}</span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemoveCustomer}>
            Cambiar
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Seleccionar cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Seleccionar Cliente</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Search results */}
                <div>
                  <h3 className="font-medium mb-2">Clientes existentes</h3>
                  <ScrollArea className="h-64 border rounded-lg p-2">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : customers.length === 0 && searchTerm ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No se encontraron clientes</p>
                      </div>
                    ) : customers.length === 0 && !searchTerm ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Busca un cliente existente</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customers.map((customer) => (
                          <Card 
                            key={customer.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{customer.name}</h4>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    {customer.documentNumber && (
                                      <p>{customer.documentType}: {customer.documentNumber}</p>
                                    )}
                                    {customer.phone && <p>Tel: {customer.phone}</p>}
                                    {customer.email && <p>Email: {customer.email}</p>}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* New customer form */}
                <div>
                  <h3 className="font-medium mb-2">Crear nuevo cliente</h3>
                  <div className="space-y-3 border rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium">Tipo Documento</label>
                        <Select value={newCustomer.documentType} onValueChange={(value) => setNewCustomer(prev => ({ ...prev, documentType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium">Número</label>
                        <Input
                          value={newCustomer.documentNumber}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, documentNumber: e.target.value }))}
                          placeholder="123456789"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium">Nombre *</label>
                      <Input
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium">Teléfono</label>
                        <Input
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="3001234567"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Email</label>
                        <Input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium">Departamento</label>
                        <Input
                          value={newCustomer.department}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="Antioquia"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Ciudad</label>
                        <Input
                          value={newCustomer.city}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Medellín"
                        />
                      </div>
                    </div>

                    <Button onClick={handleCreateCustomer} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Cliente
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}