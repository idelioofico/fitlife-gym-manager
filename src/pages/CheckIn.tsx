import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  QrCode, 
  UserCheck, 
  UserX, 
  Clock, 
  Users, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  Camera,
  Scan,
  History,
  TrendingUp,
  Calendar,
  Timer,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: string;
  planExpiry: Date;
  qrCode: string;
  photo?: string;
  lastCheckIn?: Date;
  totalCheckIns: number;
  membershipStatus: 'valid' | 'expired' | 'suspended';
}

interface CheckInRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberPhoto?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // minutos
  method: 'qr' | 'search' | 'manual';
  location: string;
  status: 'active' | 'completed';
}

const CheckIn = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'warning' | 'error', message: string} | null>(null);
  const [qrScannerActive, setQrScannerActive] = useState(false);
  
  // Capacidade do ginásio
  const [gymCapacity] = useState({
    maximum: 120,
    current: 45,
    areas: {
      gym: { max: 60, current: 28 },
      cardio: { max: 30, current: 12 },
      classes: { max: 30, current: 5 }
    }
  });

  // Mock data
  useEffect(() => {
    const mockMembers: Member[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '+258 84 123 4567',
        status: 'active',
        plan: 'Premium Mensal',
        planExpiry: new Date('2024-07-15'),
        qrCode: 'HFL001',
        lastCheckIn: new Date('2024-06-19'),
        totalCheckIns: 45,
        membershipStatus: 'valid'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '+258 82 234 5678',
        status: 'active',
        plan: 'Básico Mensal',
        planExpiry: new Date('2024-07-01'),
        qrCode: 'HFL002',
        lastCheckIn: new Date('2024-06-18'),
        totalCheckIns: 38,
        membershipStatus: 'valid'
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '+258 87 345 6789',
        status: 'active',
        plan: 'Premium Mensal',
        planExpiry: new Date('2024-08-10'),
        qrCode: 'HFL003',
        lastCheckIn: new Date('2024-06-20'),
        totalCheckIns: 52,
        membershipStatus: 'valid'
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '+258 84 456 7890',
        status: 'suspended',
        plan: 'Básico Mensal',
        planExpiry: new Date('2024-06-15'),
        qrCode: 'HFL004',
        lastCheckIn: new Date('2024-06-10'),
        totalCheckIns: 25,
        membershipStatus: 'suspended'
      }
    ];

    const mockCheckInRecords: CheckInRecord[] = [
      {
        id: '1',
        memberId: '1',
        memberName: 'João Silva',
        checkInTime: new Date('2024-06-20T08:30:00'),
        method: 'qr',
        location: 'Entrada Principal',
        status: 'active'
      },
      {
        id: '2',
        memberId: '4',
        memberName: 'Ana Costa',
        checkInTime: new Date('2024-06-20T09:15:00'),
        method: 'search',
        location: 'Entrada Principal',
        status: 'active'
      },
      {
        id: '3',
        memberId: '2',
        memberName: 'Maria Santos',
        checkInTime: new Date('2024-06-19T18:45:00'),
        checkOutTime: new Date('2024-06-19T20:15:00'),
        duration: 90,
        method: 'qr',
        location: 'Entrada Principal',
        status: 'completed'
      }
    ];

    setMembers(mockMembers);
    setCheckInRecords(mockCheckInRecords);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredMembers([]);
    } else {
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(term.toLowerCase()) ||
        member.email.toLowerCase().includes(term.toLowerCase()) ||
        member.phone.includes(term) ||
        member.qrCode.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  };

  const handleCheckIn = (member: Member, method: 'qr' | 'search' | 'manual') => {
    // Verificar status do membro
    if (member.membershipStatus !== 'valid') {
      setAlertMessage({
        type: 'error',
        message: `Check-in negado: ${member.name} tem plano ${member.membershipStatus === 'expired' ? 'expirado' : 'suspenso'}`
      });
      return;
    }

    // Verificar se já está no ginásio
    const existingCheckIn = checkInRecords.find(
      record => record.memberId === member.id && record.status === 'active'
    );

    if (existingCheckIn) {
      setAlertMessage({
        type: 'warning',
        message: `${member.name} já está no ginásio desde ${format(existingCheckIn.checkInTime, 'HH:mm')}`
      });
      return;
    }

    // Verificar capacidade
    if (gymCapacity.current >= gymCapacity.maximum) {
      setAlertMessage({
        type: 'error',
        message: 'Capacidade máxima atingida. Check-in não permitido.'
      });
      return;
    }

    // Realizar check-in
    const newCheckIn: CheckInRecord = {
      id: Date.now().toString(),
      memberId: member.id,
      memberName: member.name,
      memberPhoto: member.photo,
      checkInTime: new Date(),
      method,
      location: 'Entrada Principal',
      status: 'active'
    };

    setCheckInRecords([newCheckIn, ...checkInRecords]);
    
    // Atualizar capacidade
    gymCapacity.current += 1;
    gymCapacity.areas.gym.current += 1;

    // Atualizar último check-in do membro
    const updatedMembers = members.map(m => 
      m.id === member.id 
        ? { ...m, lastCheckIn: new Date(), totalCheckIns: m.totalCheckIns + 1 }
        : m
    );
    setMembers(updatedMembers);

    setAlertMessage({
      type: 'success',
      message: `Check-in realizado com sucesso! Bem-vindo(a), ${member.name}!`
    });

    // Limpar busca
    setSearchTerm('');
    setFilteredMembers([]);
  };

  const handleCheckOut = (checkInId: string) => {
    const checkInRecord = checkInRecords.find(r => r.id === checkInId);
    if (checkInRecord) {
      const duration = Math.round((new Date().getTime() - checkInRecord.checkInTime.getTime()) / (1000 * 60));
      
      const updatedRecord = {
        ...checkInRecord,
        checkOutTime: new Date(),
        duration,
        status: 'completed' as const
      };

      setCheckInRecords(checkInRecords.map(r => r.id === checkInId ? updatedRecord : r));
      
      // Atualizar capacidade
      gymCapacity.current -= 1;
      gymCapacity.areas.gym.current -= 1;

      setAlertMessage({
        type: 'success',
        message: `Check-out realizado! ${checkInRecord.memberName} permaneceu ${duration} minutos.`
      });
    }
  };

  const getMembershipStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">Válido</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">No Ginásio</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Finalizado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const activeCheckIns = checkInRecords.filter(r => r.status === 'active');
  const todayCheckIns = checkInRecords.filter(r => 
    format(r.checkInTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <MainLayout title="Controlo de Acesso">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Controlo de Acesso</h1>
            <p className="text-gray-600">Sistema de check-in/check-out do ginásio Hefel</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setQrScannerActive(!qrScannerActive)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              {qrScannerActive ? 'Parar Scanner' : 'Scanner QR'}
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {alertMessage && (
          <Alert className={
            alertMessage.type === 'success' ? 'border-green-200 bg-green-50' :
            alertMessage.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-red-200 bg-red-50'
          }>
            {alertMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
             alertMessage.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
             <XCircle className="h-4 w-4" />}
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* Capacidade Atual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ocupação Total</p>
                  <p className="text-2xl font-bold">{gymCapacity.current}/{gymCapacity.maximum}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(gymCapacity.current / gymCapacity.maximum) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((gymCapacity.current / gymCapacity.maximum) * 100)}% ocupado
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Área Ginásio</p>
                  <p className="text-2xl font-bold">{gymCapacity.areas.gym.current}/{gymCapacity.areas.gym.max}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Área Cardio</p>
                  <p className="text-2xl font-bold">{gymCapacity.areas.cardio.current}/{gymCapacity.areas.cardio.max}</p>
                </div>
                <Timer className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Check-ins Hoje</p>
                  <p className="text-2xl font-bold">{todayCheckIns.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-in Manual */}
          <Card>
            <CardHeader>
              <CardTitle>Check-in Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou código QR..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {qrScannerActive && (
                <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg text-center">
                  <QrCode className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Scanner QR ativo - aponte a câmera para o código QR</p>
                </div>
              )}

              {filteredMembers.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.photo} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.plan}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getMembershipStatusBadge(member.membershipStatus)}
                            <Badge variant="outline" className="text-xs">{member.qrCode}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(member, 'search')}
                          disabled={member.membershipStatus !== 'valid'}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Check-in
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberDetail(true);
                          }}
                        >
                          <MapPin className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membros Ativos no Ginásio */}
          <Card>
            <CardHeader>
              <CardTitle>Membros no Ginásio ({activeCheckIns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeCheckIns.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={record.memberPhoto} />
                        <AvatarFallback>
                          {record.memberName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{record.memberName}</p>
                        <p className="text-sm text-gray-600">
                          Entrada: {format(record.checkInTime, 'HH:mm')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(record.status)}
                          <Badge variant="outline" className="text-xs">
                            {record.method === 'qr' ? 'QR Code' : 
                             record.method === 'search' ? 'Busca' : 'Manual'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckOut(record.id)}
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Check-out
                    </Button>
                  </div>
                ))}
                {activeCheckIns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum membro no ginásio no momento</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Histórico de Hoje ({todayCheckIns.length} check-ins)</span>
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                Ver Histórico Completo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayCheckIns.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={record.memberPhoto} />
                      <AvatarFallback className="text-xs">
                        {record.memberName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{record.memberName}</p>
                      <p className="text-sm text-gray-600">
                        {format(record.checkInTime, 'HH:mm')} - {record.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(record.status)}
                    {record.duration && (
                      <p className="text-sm text-gray-600 mt-1">{record.duration} min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{todayCheckIns.length}</div>
              <div className="text-sm text-gray-600">Check-ins Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeCheckIns.length}</div>
              <div className="text-sm text-gray-600">Ativos Agora</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {todayCheckIns.filter(r => r.duration).length > 0 
                  ? Math.round(todayCheckIns.filter(r => r.duration).reduce((acc, r) => acc + (r.duration || 0), 0) / todayCheckIns.filter(r => r.duration).length)
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Tempo Médio (min)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((gymCapacity.current / gymCapacity.maximum) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Ocupação Atual</div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Detalhes do Membro */}
        <Dialog open={showMemberDetail} onOpenChange={setShowMemberDetail}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Membro</DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedMember.photo} />
                    <AvatarFallback>
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                    <p className="text-gray-600">{selectedMember.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getMembershipStatusBadge(selectedMember.membershipStatus)}
                      <Badge variant="outline">{selectedMember.qrCode}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Plano</p>
                    <p>{selectedMember.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vencimento</p>
                    <p>{format(selectedMember.planExpiry, 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                    <p>{selectedMember.totalCheckIns}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Último Check-in</p>
                    <p>{selectedMember.lastCheckIn ? format(selectedMember.lastCheckIn, 'dd/MM/yyyy HH:mm') : 'Nunca'}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => {
                      handleCheckIn(selectedMember, 'manual');
                      setShowMemberDetail(false);
                    }}
                    disabled={selectedMember.membershipStatus !== 'valid'}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Realizar Check-in
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CheckIn;
