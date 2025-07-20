import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ProductCatalog from '@/components/products/ProductCatalog';

const ProductsPage: React.FC = () => {
  return (
    <MainLayout>
      <ProductCatalog />
    </MainLayout>
  );
};

export default ProductsPage; 