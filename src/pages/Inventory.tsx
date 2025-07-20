import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import StockManager from '@/components/products/StockManager';

const InventoryPage: React.FC = () => {
  return (
    <MainLayout>
      <StockManager />
    </MainLayout>
  );
};

export default InventoryPage; 