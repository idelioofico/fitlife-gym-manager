import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CalendarClock, LogIn, LogOut, Search, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRecentCheckIns, getMembers, recordCheckIn } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CheckInForm from '@/components/checkin/CheckInForm';
import { format } from 'date-fns';

const CheckIn = () => {
  const { toast } = useToast();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    fetchRecentCheckIns();
  }, []);
  
  const fetchRecentCheckIns = async () => {
    setLoading(true);
    try {
      const data = await getRecentCheckIns();
      setCheckIns(data);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const members = await getMembers(searchTerm);
      setSearchResults(members);
    } catch (error) {
      console.error("Error searching members:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckInSuccess = () => {
    setIsCheckInDialogOpen(false);
    fetchRecentCheckIns();
    toast({
      title: "Check-in registrado",
      description: "O check-in foi registrado com sucesso.",
    });
  };

  const handleQuickCheckIn = async (member, checkType) => {
    try {
      await recordCheckIn({
        member_id: member.id,
        check_type: checkType
      });
      
      fetchRecentCheckIns();
      setSearchTerm('');
      setSearchResults([]);
      
      toast({
        title: `${checkType} registrado`,
        description: `${checkType} de ${member.name} registrado com sucesso.`,
      });
    } catch (error) {
      console.error("Error recording quick check-in:", error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o check-in.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout title="Check-In">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Check-in</h2>
          <div className="flex items-center mt-2 md:mt-0">
            <Button onClick={() => setIsCheckInDialogOpen(true)}>
              <UserCheck className="h-4 w-4 mr-2" />
              Novo Check-in
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Busca Rápida</CardTitle>
              <CardDescription>Buscar utente pelo nome, email ou telefone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar utente..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>
              
              <div className="border rounded-lg">
                {isSearching ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Buscando utentes...</p>
                  </div>
                ) : searchTerm && searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nenhum utente encontrado</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((member) => (
                      <div 
                        key={member.id} 
                        className="border-b last:border-b-0 p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={member.status === 'Ativo' ? 'default' : 'outline'}>
                                {member.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Plano: {member.plan}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="h-8"
                              onClick={() => handleQuickCheckIn(member, 'Entrada')}
                            >
                              <LogIn className="h-4 w-4 mr-1" />
                              Entrada
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8"
                              onClick={() => handleQuickCheckIn(member, 'Saída')}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Saída
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Check-ins Recentes</CardTitle>
              <CardDescription>Lista dos últimos registros de entrada e saída</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Carregando check-ins...</p>
                  </div>
                ) : checkIns.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nenhum check-in registrado</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {checkIns.map((checkIn) => (
                      <div 
                        key={checkIn.id} 
                        className="border-b last:border-b-0 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            checkIn.check_type === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {checkIn.check_type === 'Entrada' ? (
                              <LogIn className="h-5 w-5" />
                            ) : (
                              <LogOut className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">
                              {checkIn.member_name || 'Utente desconhecido'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-normal">
                                {checkIn.plan || 'Sem plano'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {checkIn.check_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarClock className="h-3.5 w-3.5 mr-1" />
                            {format(new Date(checkIn.check_time), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Check-in</DialogTitle>
          </DialogHeader>
          <CheckInForm onSuccess={handleCheckInSuccess} />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CheckIn;
