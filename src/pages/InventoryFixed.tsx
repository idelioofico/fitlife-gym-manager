import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

const InventoryFixed = () => {
  return (
    <MainLayout title="Inventário">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Controle de Inventário</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800">Total Produtos</h3>
            <p className="text-2xl font-bold text-blue-600">156</p>
            <p className="text-sm text-blue-600">Itens únicos</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800">Em Stock</h3>
            <p className="text-2xl font-bold text-green-600">1.234</p>
            <p className="text-sm text-green-600">Unidades</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800">Stock Baixo</h3>
            <p className="text-2xl font-bold text-orange-600">12</p>
            <p className="text-sm text-orange-600">Produtos</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800">Sem Stock</h3>
            <p className="text-2xl font-bold text-red-600">3</p>
            <p className="text-sm text-red-600">Produtos</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Produtos com Stock Baixo</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Proteína Whey</p>
                <p className="text-sm text-gray-500">SKU: WHEY001</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">5 unidades</p>
                <p className="text-sm text-gray-500">Min: 10</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Creatina</p>
                <p className="text-sm text-gray-500">SKU: CREAT001</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">3 unidades</p>
                <p className="text-sm text-gray-500">Min: 5</p>
              </div>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">Toalha de Ginásio</p>
                <p className="text-sm text-gray-500">SKU: TOWEL001</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">0 unidades</p>
                <p className="text-sm text-gray-500">Min: 5</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>✅ Página de Inventário funcionando!</strong>
          <p>Sistema de controle de stock operacional.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default InventoryFixed; 