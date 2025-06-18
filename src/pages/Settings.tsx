import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import PaymentSettingsForm from '@/components/settings/PaymentSettingsForm';
import NotificationSettingsForm from '@/components/settings/NotificationSettingsForm';
import UserManagement from '@/components/admin/UserManagement';
import RoleManagement from '@/components/admin/RoleManagement';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Database } from 'lucide-react';
import { getSettings, createBackup, exportData } from '@/lib/api';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data || {});
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSettingsUpdate = () => {
    toast({
      title: "Configurações atualizadas",
      description: "As configurações foram atualizadas com sucesso."
    });
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const result = await createBackup();
      toast({
        title: "Backup Criado",
        description: "Backup criado com sucesso!",
      });
      
      // Download the backup as JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitlife-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Erro no Backup",
        description: "Erro ao criar backup. Tente novamente.",
        variant: 'destructive',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    setExportLoading(true);
    try {
      await exportData(format);
      toast({
        title: "Exportação Concluída",
        description: `Dados exportados em formato ${format.toUpperCase()} com sucesso!`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na Exportação",
        description: "Erro ao exportar dados. Tente novamente.",
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <MainLayout title="Configurações">
      <div className="space-y-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-7">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="users">Utilizadores</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Ginásio</CardTitle>
                <CardDescription>Configurações básicas do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <GeneralSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>Gerencie os métodos de pagamento e taxas</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentSettingsForm initialData={settings} onSuccess={handleSettingsUpdate} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Utilizadores</CardTitle>
                <CardDescription>Crie e gerencie utilizadores do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Roles</CardTitle>
                <CardDescription>Crie e gerencie roles e permissões</CardDescription>
              </CardHeader>
              <CardContent>
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>Gerencie como os clientes recebem notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettingsForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Exportação</CardTitle>
                <CardDescription>Gerencie a segurança dos seus dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">Backup Manual</h3>
                  <p className="text-sm text-muted-foreground">Faça backup manual dos seus dados agora</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleBackup} disabled={backupLoading}>
                      <Download className="h-4 w-4 mr-2" />
                      Backup Completo
                    </Button>
                    <Button variant="outline" onClick={() => handleExportData('json')} disabled={exportLoading}>
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar Dados JSON
                    </Button>
                    <Button variant="outline" onClick={() => handleExportData('csv')} disabled={exportLoading}>
                      <Database className="h-4 w-4 mr-2" />
                      Exportar Dados CSV
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <h3 className="text-md font-medium">Histórico de Backup</h3>
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      O histórico de backups será exibido aqui
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
