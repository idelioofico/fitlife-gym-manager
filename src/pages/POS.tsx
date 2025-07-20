import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import POS from '@/components/sales/POS';

const POSPage: React.FC = () => {
  return (
    <MainLayout>
      <POS />
    </MainLayout>
  );
};

export default POSPage; 