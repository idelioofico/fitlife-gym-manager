import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { db, Product, Sale } from '@/lib/database';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Search,
  Package,
  User,
  Receipt,
  Calculator,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

const POSFixed = () => {
  // Produtos disponíveis (carregados da base de dados)
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    amountPaid: 0,
    change: 0
  });

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'suplementos', name: 'Suplementos' },
    { id: 'vestuario', name: 'Vestuário' },
    { id: 'acessorios', name: 'Acessórios' }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Dinheiro', icon: DollarSign },
    { id: 'card', name: 'Cartão', icon: CreditCard },
    { id: 'transfer', name: 'Transferência', icon: CreditCard },
    { id: 'mpesa', name: 'M-Pesa', icon: CreditCard }
  ];

  // Carregar produtos da base de dados
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const dbProducts = db.getAll('products').filter(p => p.status === 'active' && p.stock > 0);
    setProducts(dbProducts);
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const isAvailable = product.status === 'active' && product.stock > 0;
    
    return matchesSearch && matchesCategory && isAvailable;
  });

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        subtotal: product.price
      }]);
    }
  };

  // Remover produto do carrinho
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Atualizar quantidade
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product || quantity > product.stock) return;

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity, subtotal: quantity * item.product.price }
        : item
    ));
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '' });
    setPaymentInfo({ method: 'cash', amountPaid: 0, change: 0 });
  };

  // Calcular totais
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxRate = 0.17; // IVA 17%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Calcular troco
  useEffect(() => {
    if (paymentInfo.method === 'cash' && paymentInfo.amountPaid > 0) {
      setPaymentInfo(prev => ({
        ...prev,
        change: Math.max(0, prev.amountPaid - total)
      }));
    } else {
      setPaymentInfo(prev => ({ ...prev, change: 0 }));
    }
  }, [paymentInfo.amountPaid, total, paymentInfo.method]);

  // Finalizar venda
  const completeSale = () => {
    if (cart.length === 0) return;
    
    if (paymentInfo.method === 'cash' && paymentInfo.amountPaid < total) {
      alert('Valor pago insuficiente!');
      return;
    }

    try {
      const saleNumber = db.generateSaleNumber();
      
      const sale = {
        number: saleNumber,
        customerName: customerInfo.name || 'Cliente Anônimo',
        customerPhone: customerInfo.phone || undefined,
        date: new Date().toISOString().split('T')[0],
        items: cart.map((item, index) => ({
          id: index.toString(),
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          discount: 0,
          total: item.subtotal
        })),
        subtotal,
        discountAmount: 0,
        taxAmount: Math.round(tax),
        total: Math.round(total),
        paymentMethod: paymentInfo.method as Sale['paymentMethod'],
        paymentStatus: 'paid' as Sale['paymentStatus'],
        createdBy: 'pos@hefel.com',
        invoiceGenerated: false,
        receiptGenerated: false
      };

      // Criar venda na base de dados
      const createdSale = db.create('sales', sale);

      // Atualizar stock dos produtos
      cart.forEach(item => {
        const currentProduct = db.getById('products', item.product.id);
        if (currentProduct) {
          db.update('products', item.product.id, {
            stock: currentProduct.stock - item.quantity
          });
        }
      });

      // Recarregar produtos para refletir novo stock
      loadProducts();

      setLastSale(createdSale);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      clearCart();
      
      alert('Venda realizada com sucesso!');
    } catch (error) {
      alert('Erro ao processar venda: ' + error);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'suplementos': return 'bg-blue-100 text-blue-800';
      case 'vestuario': return 'bg-green-100 text-green-800';
      case 'acessorios': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout title="Ponto de Venda">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ponto de Venda</h1>
            <p className="text-gray-600">Sistema de vendas do ginásio Hefel</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Itens no carrinho</p>
              <p className="text-2xl font-bold text-blue-600">{cart.length}</p>
            </div>
            <Button 
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Finalizar Venda
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Produtos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Disponíveis</CardTitle>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar produtos..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                            <Badge className={getCategoryBadgeColor(product.category)}>
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-bold text-green-600">
                              {product.price.toLocaleString('pt-MZ')} MZN
                            </p>
                            <p className="text-sm text-gray-500">
                              Stock: {product.stock} unidades
                            </p>
                          </div>
                          <Button 
                            onClick={() => addToCart(product)}
                            size="sm"
                            disabled={product.stock === 0}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredProducts.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum produto encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Carrinho */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrinho de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Carrinho vazio</p>
                    <p className="text-sm text-gray-500">Adicione produtos para iniciar uma venda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.product.price.toLocaleString('pt-MZ')} MZN cada
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="font-bold">
                            {item.subtotal.toLocaleString('pt-MZ')} MZN
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{subtotal.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA (17%):</span>
                        <span>{tax.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">{total.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Finalizar Venda
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="w-full"
                      >
                        Limpar Carrinho
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog de Checkout */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Finalizar Venda</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Resumo da Venda */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Resumo da Venda</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>{item.subtotal.toLocaleString('pt-MZ')} MZN</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{total.toLocaleString('pt-MZ')} MZN</span>
                  </div>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div>
                <h3 className="font-semibold mb-3">Informações do Cliente (Opcional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Nome</Label>
                    <Input
                      id="customerName"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Telefone</Label>
                    <Input
                      id="customerPhone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="Número de telefone"
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pagamento */}
              <div>
                <h3 className="font-semibold mb-3">Método de Pagamento</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentInfo({...paymentInfo, method: method.id})}
                        className={`flex items-center p-3 border rounded-lg ${
                          paymentInfo.method === method.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-2" />
                        <span>{method.name}</span>
                      </button>
                    );
                  })}
                </div>

                {paymentInfo.method === 'cash' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amountPaid">Valor Pago</Label>
                      <Input
                        id="amountPaid"
                        type="number"
                        value={paymentInfo.amountPaid}
                        onChange={(e) => setPaymentInfo({...paymentInfo, amountPaid: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Troco</Label>
                      <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                        <span className={paymentInfo.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {paymentInfo.change.toLocaleString('pt-MZ')} MZN
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={completeSale} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Venda
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Recibo */}
        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Venda Concluída!</DialogTitle>
            </DialogHeader>
            
            {lastSale && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Venda #{lastSale.number}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(lastSale.date).toLocaleString('pt-MZ')}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">GINÁSIO HEFEL</h3>
                    <p className="text-sm text-gray-600">Recibo de Venda</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {lastSale.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.productName} x{item.quantity}</span>
                        <span>{item.total.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{lastSale.subtotal.toLocaleString('pt-MZ')} MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (17%):</span>
                      <span>{lastSale.taxAmount.toLocaleString('pt-MZ')} MZN</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">{lastSale.total.toLocaleString('pt-MZ')} MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pagamento:</span>
                      <span>{lastSale.paymentMethod}</span>
                    </div>
                    {lastSale.customerName && (
                      <div className="flex justify-between">
                        <span>Cliente:</span>
                        <span>{lastSale.customerName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsReceiptOpen(false)}>
                    Fechar
                  </Button>
                  <Button className="flex-1">
                    <Receipt className="w-4 h-4 mr-2" />
                    Imprimir Recibo
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default POSFixed; 