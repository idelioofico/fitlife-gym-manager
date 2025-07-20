import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ExpenseReports from '@/components/expenses/ExpenseReports';

const ExpenseReportsPage: React.FC = () => {
  return (
    <MainLayout>
      <ExpenseReports />
    </MainLayout>
  );
};

export default ExpenseReportsPage; 