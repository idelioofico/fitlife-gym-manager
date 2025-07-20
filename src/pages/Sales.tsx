import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import SalesHistory from '@/components/sales/SalesHistory';

const SalesPage: React.FC = () => {
  return (
    <MainLayout>
      <SalesHistory />
    </MainLayout>
  );
};

export default SalesPage; 