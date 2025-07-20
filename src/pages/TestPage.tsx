import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';

const TestPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-green-600">Página de Teste</h1>
        <p className="mt-4 text-lg">Se você está vendo esta mensagem, o roteamento está funcionando!</p>
        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <h2 className="text-xl font-semibold">Status dos Componentes:</h2>
          <ul className="mt-2 space-y-1">
            <li>✅ MainLayout carregado</li>
            <li>✅ Roteamento funcionando</li>
            <li>✅ Tailwind CSS aplicado</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default TestPage; 