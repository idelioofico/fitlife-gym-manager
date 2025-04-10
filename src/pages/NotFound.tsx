
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';

const NotFound = () => {
  return (
    <MainLayout title="Página não encontrada">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Ir para Dashboard</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
