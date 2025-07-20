import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { env } from '@/config/env';

const TestBilling: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testWithoutAuth = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${env.API_URL}/test-billing`);
      const data = await response.json();
      
      setResult({ type: 'without-auth', data });
      toast({
        title: "Sucesso",
        description: "Endpoint sem auth funcionando",
      });
    } catch (error) {
      console.error('Error testing without auth:', error);
      toast({
        title: "Erro",
        description: "Erro ao testar endpoint sem auth",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWithAuth = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      console.log('Token for test:', token);
      
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const response = await fetch(`${env.API_URL}/billing/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
      }
      
      const data = await response.json();
      setResult({ type: 'with-auth', data });
      toast({
        title: "Sucesso",
        description: "Endpoint com auth funcionando",
      });
    } catch (error) {
      console.error('Error testing with auth:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao testar endpoint com auth",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teste de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button onClick={testWithoutAuth} disabled={loading}>
            Testar Sem Auth
          </Button>
          <Button onClick={testWithAuth} disabled={loading}>
            Testar Com Auth
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestBilling; 