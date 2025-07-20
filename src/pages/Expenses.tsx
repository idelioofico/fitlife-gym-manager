import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import ExpenseList from '@/components/expenses/ExpenseList';

const ExpensesPage: React.FC = () => {
  return (
    <MainLayout>
      <ExpenseList />
    </MainLayout>
  );
};

export default ExpensesPage; 