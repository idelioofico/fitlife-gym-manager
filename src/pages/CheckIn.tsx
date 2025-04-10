
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, QrCode, Search, UserCheck, UserX } from 'lucide-react';

// Mock check-in data
const checkInRecords = [
  { id: 1, name: 'Maria Costa', time: '09:15', date: '2025-04-10', status: 'Entrada' },
  { id: 2, name: 'João Silva', time: '10:22', date: '2025-04-10', status: 'Entrada' },
  { id: 3, name: 'Pedro Machava', time: '11:05', date: '2025-04-10', status: 'Entrada' },
  { id: 4, name: 'Ana Maria', time: '12:30', date: '2025-04-10', status: 'Saída' },
  { id: 5, name: 'Sofia Langa', time: '13:45', date: '2025-04-10', status: 'Entrada' },
];

const CheckIn = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);
  const [lastCheckin, setLastCheckin] = React.useState<{ name: string; status: string } | null>(null);

  // Simulate QR scanning
  const handleScanQR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastCheckin({
        name: 'Carlos Nuvunga',
        status: 'Entrada'
      });
      // Show success for 3 seconds then clear
      setTimeout(() => setLastCheckin(null), 3000);
    }, 2000);
  };

  return (
    <MainLayout title="Check-In">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Controlo de Acesso</h2>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Sistema Ativo
            </span>
          </div>
        </div>

        <Tabs defaultValue="checkin" className="space-y-4">
          <TabsList>
            <TabsTrigger value="checkin">Registar Acesso</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkin">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leitor QR Code</CardTitle>
                  <CardDescription>Escaneie o código do utente para registar entrada/saída</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="w-64 h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center mb-4">
                    {isScanning ? (
                      <div className="flex flex-col items-center">
                        <div className="h-20 w-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>A processar...</p>
                      </div>
                    ) : lastCheckin ? (
                      <div className="flex flex-col items-center text-center">
                        <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
                        <p className="text-lg font-bold">{lastCheckin.name}</p>
                        <Badge className="mt-2">{lastCheckin.status} registada</Badge>
                      </div>
                    ) : (
                      <QrCode className="h-20 w-20 text-muted-foreground" />
                    )}
                  </div>
                  <Button className="w-full" size="lg" onClick={handleScanQR} disabled={isScanning}>
                    {isScanning ? "A escanear..." : "Escanear QR Code"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Busca Manual</CardTitle>
                  <CardDescription>Pesquise o utente pelo nome ou ID</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Pesquisar utente..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-md p-4">
                    {searchTerm ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                          <span className="text-xl font-bold text-gray-600">MS</span>
                        </div>
                        <h3 className="text-lg font-medium">Maria Silva</h3>
                        <p className="text-sm text-muted-foreground mb-2">ID: #1234 • Plano Premium</p>
                        <Badge variant="outline" className="mb-4">Status: Ativo</Badge>
                        
                        <div className="flex gap-2 w-full">
                          <Button className="flex-1" variant="outline">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Entrada
                          </Button>
                          <Button className="flex-1" variant="outline">
                            <UserX className="mr-2 h-4 w-4" />
                            Saída
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-center">
                        <p className="text-muted-foreground">
                          Digite o nome ou ID do utente<br />para registar acesso manualmente
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Acessos</CardTitle>
                <CardDescription>Registos recentes de entrada e saída</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkInRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.time}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'Entrada' ? 'default' : 'secondary'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CheckIn;
