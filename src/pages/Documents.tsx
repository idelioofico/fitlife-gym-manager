import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import DocumentHistory from '@/components/documents/DocumentHistory';

const DocumentsPage: React.FC = () => {
  return (
    <MainLayout>
      <DocumentHistory />
    </MainLayout>
  );
};

export default DocumentsPage; 