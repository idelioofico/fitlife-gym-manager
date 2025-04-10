
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CreditCard, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

interface MemberDetailProps {
  member: any;
  onClose: () => void;
  onEdit: () => void;
  onRenew: () => void;
}

const MemberDetail: React.FC<MemberDetailProps> = ({ 
  member, 
  onClose, 
  onEdit, 
  onRenew 
}) => {
  if (!member) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <div className="flex items-center mt-1">
              <Badge 
                variant={
                  member.status === 'Ativo' ? "default" :
                  member.status === 'Pendente' ? "outline" :
                  "destructive"
                }
              >
                {member.status}
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">
                ID: {member.id.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onEdit}>
            Editar Perfil
          </Button>
          <Button onClick={onRenew}>
            Renovar Plano
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 max-w-md">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="workouts">Treinos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Utente</CardTitle>
              <CardDescription>Informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-sm text-muted-foreground">{member.phone || "Não informado"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Assinatura</CardTitle>
              <CardDescription>Informação sobre o plano atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Plano Atual</p>
                    <p className="text-sm text-muted-foreground">{member.plan}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Data de Inscrição</p>
                    <p className="text-sm text-muted-foreground">
                      {member.join_date ? format(new Date(member.join_date), 'dd/MM/yyyy') : "Não informado"}
                    </p>
                  </div>
                </div>
                {member.end_date && (
                  <div className="flex items-start space-x-3 col-span-1 md:col-span-2">
                    <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Data de Término</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(member.end_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Lista de todos os pagamentos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Carregando histórico de pagamentos...</p>
                <p className="text-xs text-muted-foreground mt-2">Esta funcionalidade será implementada em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workouts">
          <Card>
            <CardHeader>
              <CardTitle>Treinos Atribuídos</CardTitle>
              <CardDescription>Lista de treinos atribuídos a este utente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Carregando treinos...</p>
                <p className="text-xs text-muted-foreground mt-2">Esta funcionalidade será implementada em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividade</CardTitle>
              <CardDescription>Check-ins, alterações de plano e outras atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Carregando histórico de atividade...</p>
                <p className="text-xs text-muted-foreground mt-2">Esta funcionalidade será implementada em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default MemberDetail;
