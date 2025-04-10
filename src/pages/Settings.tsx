
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  return (
    <MainLayout title="Configurações">
      <div className="space-y-6">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="users">Utilizadores</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Ginásio</CardTitle>
                <CardDescription>Configurações básicas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gym-name">Nome do Ginásio</Label>
                  <Input id="gym-name" defaultValue="FitLife Academy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" defaultValue="Av. Eduardo Mondlane, 123, Maputo" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="+258 84 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="contato@fitlife.co.mz" type="email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-hours">Horário de Funcionamento</Label>
                  <Input id="business-hours" defaultValue="Segunda a Sexta: 6h - 22h, Sábado: 8h - 18h, Domingo: 8h - 14h" />
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button>Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>Gerencie os métodos de pagamento e taxas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mpesa">M-Pesa</Label>
                    <Switch id="mpesa" defaultChecked />
                  </div>
                  <Input placeholder="Número M-Pesa" defaultValue="84 123 4567" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emola">e-Mola</Label>
                    <Switch id="emola" defaultChecked />
                  </div>
                  <Input placeholder="Número e-Mola" defaultValue="86 789 1234" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="netshop">NetShop do Millennium BIM</Label>
                    <Switch id="netshop" defaultChecked />
                  </div>
                  <Input placeholder="ID do Comerciante" defaultValue="FITLIFE123" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cash">Pagamento em Dinheiro</Label>
                    <Switch id="cash" defaultChecked />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-reminder">Dias de antecedência para lembrete</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="5">5 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="10">10 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button>Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Utilizadores</CardTitle>
                <CardDescription>Configurações de acesso ao sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <h3 className="text-lg font-medium">Gestão de Utilizadores</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                    A gestão de utilizadores do sistema será implementada aqui, incluindo permissões e níveis de acesso
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>Gerencie como os clientes recebem notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes e atualizações por email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes e atualizações por SMS</p>
                  </div>
                  <Switch id="sms-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-reminders">Lembretes de Pagamento</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes de pagamento próximo</p>
                  </div>
                  <Switch id="payment-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="class-reminders">Lembretes de Aulas</Label>
                    <p className="text-sm text-muted-foreground">Enviar lembretes de aulas agendadas</p>
                  </div>
                  <Switch id="class-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-messages">Comunicações de Marketing</Label>
                    <p className="text-sm text-muted-foreground">Enviar promoções e novidades aos clientes</p>
                  </div>
                  <Switch id="marketing-messages" />
                </div>
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button>Salvar Alterações</Button>
                </div>
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
                  <Label>Backup Automático</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-backup" defaultChecked />
                    <Label htmlFor="auto-backup">Ativar backup automático</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">O sistema fará backup automático dos dados diariamente</p>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label>Backup Manual</Label>
                  <p className="text-sm text-muted-foreground">Faça backup manual dos seus dados agora</p>
                  <div className="flex space-x-2">
                    <Button variant="outline">Backup Completo</Button>
                    <Button variant="outline">Exportar Dados</Button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label>Histórico de Backup</Label>
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
