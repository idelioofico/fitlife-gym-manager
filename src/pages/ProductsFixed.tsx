import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db, Product, Category } from '@/lib/database';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  BarChart3,
  Tags,
  Image as ImageIcon,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const ProductsFixed = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    sku: '',
    barcode: '',
    supplier: '',
    status: 'active' as Product['status']
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: 'bg-gray-100 text-gray-800'
  });

  // Carregar dados da base de dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const dbProducts = db.getAll('products');
    const dbCategories = db.getAll('categories').filter(c => c.type === 'product');
    
    setProducts(dbProducts);
    setCategories(dbCategories);
    
    // Se não houver produtos, adicionar alguns dados de exemplo
    if (dbProducts.length === 0) {
      const sampleProducts = [
        {
          name: 'Proteína Whey Premium',
          description: 'Proteína whey isolada de alta qualidade, sabor chocolate',
          category: 'suplementos',
          price: 2500,
          cost: 1800,
          stock: 45,
          minStock: 10,
          sku: 'WHEY001',
          barcode: '7891234567890',
          supplier: 'NutriMax',
          status: 'active' as Product['status']
        },
        {
          name: 'Creatina Monohidratada',
          description: 'Creatina pura para aumento de performance e força',
          category: 'suplementos',
          price: 1200,
          cost: 800,
          stock: 28,
          minStock: 5,
          sku: 'CREAT001',
          supplier: 'NutriMax',
          status: 'active' as Product['status']
        },
        {
          name: 'Camiseta Hefel Oficial',
          description: 'Camiseta oficial do ginásio, 100% algodão',
          category: 'vestuario',
          price: 800,
          cost: 400,
          stock: 22,
          minStock: 15,
          sku: 'CAM001',
          status: 'active' as Product['status']
        }
      ];

      sampleProducts.forEach(product => {
        db.create('products', product);
      });
      
      loadData(); // Recarregar após adicionar dados de exemplo
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, color: 'bg-gray-100 text-gray-800' };
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { status: 'out-of-stock', label: 'Sem Stock', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.minStock) return { status: 'low-stock', label: 'Stock Baixo', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'in-stock', label: 'Em Stock', color: 'bg-green-100 text-green-800' };
  };

  const getMargin = (product: Product) => {
    return Math.round(((product.price - product.cost) / product.price) * 100);
  };

  const createProduct = () => {
    try {
      const product = db.create('products', newProduct);
      setProducts(db.getAll('products'));
      setIsCreateModalOpen(false);
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 0,
        sku: '',
        barcode: '',
        supplier: '',
        status: 'active'
      });
      alert('Produto criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar produto: ' + error);
    }
  };

  const updateProduct = () => {
    if (!selectedProduct) return;

    try {
      db.update('products', selectedProduct.id, selectedProduct);
      setProducts(db.getAll('products'));
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      alert('Produto atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar produto: ' + error);
    }
  };

  const deleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        db.delete('products', productId);
        setProducts(db.getAll('products'));
        alert('Produto excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir produto: ' + error);
      }
    }
  };

  const createCategory = () => {
    try {
      const category: Category = {
        id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        type: 'product'
      };

      db.create('categories', category);
      setCategories(db.getAll('categories').filter(c => c.type === 'product'));
      setIsCategoryModalOpen(false);
      setNewCategory({
        name: '',
        description: '',
        color: 'bg-gray-100 text-gray-800'
      });
      alert('Categoria criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar categoria: ' + error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price': return b.price - a.price;
      case 'stock': return a.stock - b.stock;
      case 'margin': return getMargin(b) - getMargin(a);
      default: return 0;
    }
  });

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const ProductForm = ({ product, onSave, onCancel }: { 
    product?: Product, 
    onSave: () => void, 
    onCancel: () => void 
  }) => {
    const isEdit = !!product;
    const formData = isEdit ? selectedProduct! : newProduct;
    const setFormData = isEdit ? setSelectedProduct : setNewProduct;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nome do produto"
              required
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU/Código *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({...formData, sku: e.target.value})}
              placeholder="SKU001"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier || ''}
              onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              placeholder="Nome do fornecedor"
            />
          </div>
          <div>
            <Label htmlFor="price">Preço de Venda (MZN) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="cost">Custo (MZN) *</Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock Atual *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="minStock">Stock Mínimo *</Label>
            <Input
              id="minStock"
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              value={formData.barcode || ''}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              placeholder="1234567890123"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Product['status']})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="discontinued">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Descrição detalhada do produto"
            rows={3}
          />
        </div>

        {formData.price > 0 && formData.cost > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Análise Financeira:</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Margem de Lucro:</span>
                <div className="font-bold text-lg">{getMargin(formData as Product)}%</div>
              </div>
              <div>
                <span className="text-gray-600">Lucro por Unidade:</span>
                <div className="font-bold text-lg">{(formData.price - formData.cost).toLocaleString('pt-MZ')} MZN</div>
              </div>
              <div>
                <span className="text-gray-600">Valor Total em Stock:</span>
                <div className="font-bold text-lg">{(formData.price * formData.stock).toLocaleString('pt-MZ')} MZN</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSave}>
            {isEdit ? 'Atualizar' : 'Criar'} Produto
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout title="Gestão de Produtos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
            <p className="text-gray-600">Gerencie o catálogo de produtos do ginásio Hefel</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Tags className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="catName">Nome da Categoria</Label>
                    <Input
                      id="catName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      placeholder="Nome da categoria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="catDesc">Descrição</Label>
                    <Textarea
                      id="catDesc"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                  <div>
                    <Label>Cor do Badge</Label>
                    <div className="flex space-x-2 mt-2">
                      {[
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800',
                        'bg-purple-100 text-purple-800',
                        'bg-orange-100 text-orange-800',
                        'bg-red-100 text-red-800',
                        'bg-yellow-100 text-yellow-800'
                      ].map(color => (
                        <button
                          key={color}
                          className={`px-3 py-1 rounded text-xs ${color} ${newCategory.color === color ? 'ring-2 ring-gray-400' : ''}`}
                          onClick={() => setNewCategory({...newCategory, color})}
                        >
                          Exemplo
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createCategory}>
                      Criar Categoria
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Novo Produto</DialogTitle>
                </DialogHeader>
                <ProductForm 
                  onSave={createProduct}
                  onCancel={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalProducts}</div>
                  <div className="text-sm text-gray-600">Total de Produtos</div>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalValue.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Valor Total em Stock</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{lowStockProducts}</div>
                  <div className="text-sm text-gray-600">Stock Baixo</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
                  <div className="text-sm text-gray-600">Sem Stock</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, SKU ou descrição..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="discontinued">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="margin">Margem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            const categoryInfo = getCategoryInfo(product.category);
            const margin = getMargin(product);

            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex space-x-2 mb-2">
                        <Badge className={categoryInfo.color}>
                          {categoryInfo.name}
                        </Badge>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-bold text-green-600">{product.price.toLocaleString('pt-MZ')} MZN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-medium ${product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stock} unidades
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Margem:</span>
                      <span className="font-medium text-blue-600">{margin}%</span>
                    </div>
                    {product.supplier && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fornecedor:</span>
                        <span className="font-medium">{product.supplier}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-4">Tente ajustar os filtros ou criar um novo produto.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          </div>
        )}

        {/* Dialog de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <ProductForm 
                product={selectedProduct}
                onSave={updateProduct}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedProduct(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ProductsFixed; 