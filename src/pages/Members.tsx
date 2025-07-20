import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  CreditCard,
  Activity,
  Clock,
  User,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { getMembers, createMember, updateMember, getPlans, getGenders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: 'M' | 'F' | 'Other';
  document: string;
  nr_cartao?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  fitnessGoals: string[];
  medicalRestrictions: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  plan: string;
  planExpiry: Date;
  photo?: string;
  qrCode: string;
  lastCheckIn?: Date;
  totalCheckIns: number;
  paymentHistory: Payment[];
  checkInHistory: CheckIn[];
}

interface Payment {
  id: string;
  date: Date;
  amount: number;
  method: string;
  status: 'paid' | 'pending' | 'overdue';
  plan: string;
  period: string;
}

interface CheckIn {
  id: string;
  date: Date;
  time: string;
  type: 'entry' | 'exit';
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const { toast } = useToast();

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [membersData, plansData] = await Promise.all([
          getMembers(),
          getPlans()
        ]);
        
        // Transform API data to match our Member interface
        const transformedMembers = membersData.map((member: any) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          birthDate: member.birth_date ? new Date(member.birth_date) : new Date(),
          gender: member.gender || 'M',
          document: member.document || '',
          nr_cartao: member.nr_cartao || '',
          address: {
            street: member.street || '',
            city: member.city || '',
            province: member.province || '',
            postalCode: ''
          },
          emergencyContact: {
            name: member.emergency_name || '',
            phone: member.emergency_phone || '',
            relationship: member.emergency_relationship || ''
          },
          fitnessGoals: member.fitness_goals ? member.fitness_goals.split(',').map((g: string) => g.trim()) : [],
          medicalRestrictions: member.medical_restrictions || '',
          registrationDate: member.created_at ? new Date(member.created_at) : new Date(),
          status: member.status || 'active',
          plan: member.plan || '',
          planExpiry: member.end_date ? new Date(member.end_date) : new Date(),
          qrCode: member.id.slice(-6),
          totalCheckIns: 0,
          paymentHistory: [],
          checkInHistory: []
        }));
        
        setMembers(transformedMembers);
        setPlans(plansData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados dos membros.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Legacy mock data for fallback
  useEffect(() => {
    if (members.length === 0 && !loading) {
    const mockMembers: Member[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '+258 84 123 4567',
        birthDate: new Date('1990-05-15'),
        gender: 'M',
        document: '123456789',
        address: {
          street: 'Rua da Liberdade, 123',
          city: 'Maputo',
          province: 'Maputo',
          postalCode: '1100'
        },
        emergencyContact: {
          name: 'Maria Silva',
          phone: '+258 84 987 6543',
          relationship: 'Esposa'
        },
        fitnessGoals: ['Perda de peso', 'Ganho de massa muscular'],
        medicalRestrictions: 'Nenhuma',
        registrationDate: new Date('2024-01-15'),
        status: 'active',
        plan: 'Premium Mensal',
        planExpiry: new Date('2024-07-15'),
        qrCode: 'HFL001',
        lastCheckIn: new Date('2024-06-20'),
        totalCheckIns: 45,
        paymentHistory: [
          {
            id: '1',
            date: new Date('2024-06-01'),
            amount: 1500,
            method: 'Cartão',
            status: 'paid',
            plan: 'Premium Mensal',
            period: 'Junho 2024'
          }
        ],
        checkInHistory: [
          {
            id: '1',
            date: new Date('2024-06-20'),
            time: '08:30',
            type: 'entry'
          }
        ]
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '+258 82 234 5678',
        birthDate: new Date('1985-08-22'),
        gender: 'F',
        document: '987654321',
        address: {
          street: 'Av. Julius Nyerere, 456',
          city: 'Maputo',
          province: 'Maputo',
          postalCode: '1101'
        },
        emergencyContact: {
          name: 'Pedro Santos',
          phone: '+258 84 111 2222',
          relationship: 'Marido'
        },
        fitnessGoals: ['Condicionamento físico', 'Bem-estar'],
        medicalRestrictions: 'Problemas no joelho esquerdo',
        registrationDate: new Date('2024-02-01'),
        status: 'active',
        plan: 'Básico Mensal',
        planExpiry: new Date('2024-07-01'),
        qrCode: 'HFL002',
        lastCheckIn: new Date('2024-06-19'),
        totalCheckIns: 38,
        paymentHistory: [
          {
            id: '2',
            date: new Date('2024-06-01'),
            amount: 1000,
            method: 'Dinheiro',
            status: 'paid',
            plan: 'Básico Mensal',
            period: 'Junho 2024'
          }
        ],
        checkInHistory: [
          {
            id: '2',
            date: new Date('2024-06-19'),
            time: '18:45',
            type: 'entry'
          }
        ]
      },
      {
        id: '3',
        name: 'Carlos Mondlane',
        email: 'carlos.mondlane@email.com',
        phone: '+258 87 345 6789',
        birthDate: new Date('1992-12-10'),
        gender: 'M',
        document: '456789123',
        address: {
          street: 'Rua do Bagamoyo, 789',
          city: 'Maputo',
          province: 'Maputo',
          postalCode: '1102'
        },
        emergencyContact: {
          name: 'Ana Mondlane',
          phone: '+258 84 333 4444',
          relationship: 'Irmã'
        },
        fitnessGoals: ['Ganho de massa muscular', 'Força'],
        medicalRestrictions: 'Nenhuma',
        registrationDate: new Date('2024-03-10'),
        status: 'suspended',
        plan: 'Premium Mensal',
        planExpiry: new Date('2024-06-10'),
        qrCode: 'HFL003',
        lastCheckIn: new Date('2024-06-05'),
        totalCheckIns: 25,
        paymentHistory: [
          {
            id: '3',
            date: new Date('2024-05-01'),
            amount: 1500,
            method: 'Transferência',
            status: 'overdue',
            plan: 'Premium Mensal',
            period: 'Junho 2024'
          }
        ],
        checkInHistory: [
          {
            id: '3',
            date: new Date('2024-06-05'),
            time: '19:15',
            type: 'entry'
          }
        ]
      }
    ];
    setMembers(mockMembers);
    setFilteredMembers(mockMembers);
  }, []);

  // Filter members
  useEffect(() => {
    let filtered = members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesPlan = planFilter === 'all' || member.plan === planFilter;
      
      return matchesSearch && matchesStatus && matchesPlan;
    });
    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter, planFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setShowMemberDetail(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      setMembers(members.filter(m => m.id !== memberId));
    }
  };

  const MemberForm = () => {
    const [formData, setFormData] = useState({
      name: editingMember?.name || '',
      email: editingMember?.email || '',
      phone: editingMember?.phone || '',
      document: editingMember?.document || '',
      nr_cartao: editingMember?.nr_cartao || '',
      gender: (editingMember?.gender as 'M' | 'F' | 'Other') || 'M',
      street: editingMember?.address.street || '',
      city: editingMember?.address.city || '',
      province: editingMember?.address.province || '',
      emergencyName: editingMember?.emergencyContact.name || '',
      emergencyPhone: editingMember?.emergencyContact.phone || '',
      emergencyRelationship: editingMember?.emergencyContact.relationship || '',
      fitnessGoals: editingMember?.fitnessGoals.join(', ') || '',
      medicalRestrictions: editingMember?.medicalRestrictions || '',
      plan: editingMember?.plan || 'Básico Mensal'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const apiData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          gender: formData.gender,
          street: formData.street,
          city: formData.city,
          province: formData.province,
          emergency_name: formData.emergencyName,
          emergency_phone: formData.emergencyPhone,
          emergency_relationship: formData.emergencyRelationship,
          fitness_goals: formData.fitnessGoals,
          medical_restrictions: formData.medicalRestrictions,
          plan: formData.plan,
          status: 'active'
        };

        if (editingMember) {
          await updateMember(editingMember.id, apiData);
          toast({
            title: 'Sucesso',
            description: 'Membro atualizado com sucesso.',
          });
        } else {
          await createMember(apiData);
          toast({
            title: 'Sucesso',
            description: 'Membro criado com sucesso.',
          });
        }

        // Reload members data
        const membersData = await getMembers();
        const transformedMembers = membersData.map((member: any) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          birthDate: member.birth_date ? new Date(member.birth_date) : new Date(),
          gender: (member.gender as 'M' | 'F' | 'Other') || 'M',
          document: member.document || '',
          address: {
            street: member.street || '',
            city: member.city || '',
            province: member.province || '',
            postalCode: ''
          },
          emergencyContact: {
            name: member.emergency_name || '',
            phone: member.emergency_phone || '',
            relationship: member.emergency_relationship || ''
          },
          fitnessGoals: member.fitness_goals ? member.fitness_goals.split(',').map((g: string) => g.trim()) : [],
          medicalRestrictions: member.medical_restrictions || '',
          registrationDate: member.created_at ? new Date(member.created_at) : new Date(),
          status: member.status || 'active',
          plan: member.plan || '',
          planExpiry: member.end_date ? new Date(member.end_date) : new Date(),
          qrCode: member.id.slice(-6),
          totalCheckIns: 0,
          paymentHistory: [],
          checkInHistory: []
        }));
        
        setMembers(transformedMembers);
        setShowMemberForm(false);
        setEditingMember(null);
      } catch (error) {
        console.error('Error saving member:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar membro. Verifique os dados e tente novamente.',
          variant: 'destructive',
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="document">Documento de Identidade *</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => setFormData({...formData, document: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value as 'M' | 'F' | 'Other'})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
                <SelectItem value="Other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="plan">Plano</Label>
            <Select value={formData.plan} onValueChange={(value) => setFormData({...formData, plan: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Básico Mensal">Básico Mensal</SelectItem>
                <SelectItem value="Premium Mensal">Premium Mensal</SelectItem>
                <SelectItem value="Anual Premium">Anual Premium</SelectItem>
                <SelectItem value="Estudante">Estudante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="street">Rua/Avenida</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="province">Província</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Contato de Emergência</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="emergencyName">Nome</Label>
              <Input
                id="emergencyName"
                value={formData.emergencyName}
                onChange={(e) => setFormData({...formData, emergencyName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Telefone</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emergencyRelationship">Parentesco</Label>
              <Input
                id="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({...formData, emergencyRelationship: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="fitnessGoals">Objetivos Fitness (separados por vírgula)</Label>
          <Input
            id="fitnessGoals"
            value={formData.fitnessGoals}
            onChange={(e) => setFormData({...formData, fitnessGoals: e.target.value})}
            placeholder="Ex: Perda de peso, Ganho de massa muscular"
          />
        </div>

        <div>
          <Label htmlFor="medicalRestrictions">Restrições Médicas</Label>
          <Textarea
            id="medicalRestrictions"
            value={formData.medicalRestrictions}
            onChange={(e) => setFormData({...formData, medicalRestrictions: e.target.value})}
            placeholder="Descreva qualquer restrição médica ou digite 'Nenhuma'"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowMemberForm(false)}>
            Cancelar
          </Button>
          <Button type="submit">
            {editingMember ? 'Atualizar' : 'Cadastrar'} Membro
          </Button>
        </div>
      </form>
    );
  };

  const MemberDetail = ({ member }: { member: Member }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={member.photo} />
            <AvatarFallback className="text-lg">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <p className="text-gray-600">{member.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusBadge(member.status)}
              <Badge variant="outline">{member.qrCode}</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="health">Saúde</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span>{format(member.birthDate, 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{member.gender === 'M' ? 'Masculino' : member.gender === 'F' ? 'Feminino' : 'Outro'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p>{member.address.street}</p>
                      <p>{member.address.city}, {member.address.province}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Plano Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{member.plan}</p>
                    <p className="text-sm text-gray-600">
                      Vence em: {format(member.planExpiry, 'dd/MM/yyyy')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Contato de Emergência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">{member.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{member.emergencyContact.relationship}</p>
                    <p className="text-sm">{member.emergencyContact.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {member.paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.plan}</p>
                        <p className="text-sm text-gray-600">{payment.period}</p>
                        <p className="text-xs text-gray-500">{format(payment.date, 'dd/MM/yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{payment.amount.toLocaleString('pt-MZ')} MZN</p>
                        <p className="text-sm text-gray-600">{payment.method}</p>
                        <Badge 
                          className={
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {payment.status === 'paid' ? 'Pago' : 
                           payment.status === 'pending' ? 'Pendente' : 'Atrasado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkins">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Check-ins</CardTitle>
                <p className="text-sm text-gray-600">Total: {member.totalCheckIns} check-ins</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {member.checkInHistory.map((checkin) => (
                    <div key={checkin.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{format(checkin.date, 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-gray-600">{checkin.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {checkin.type === 'entry' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Objetivos Fitness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {member.fitnessGoals.map((goal, index) => (
                      <Badge key={index} variant="outline">{goal}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restrições Médicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{member.medicalRestrictions}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <MainLayout title="Gestão de Utentes">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Utentes</h1>
            <p className="text-gray-600">Gerir membros do ginásio Hefel</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={showMemberForm} onOpenChange={setShowMemberForm}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingMember(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Membro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? 'Editar Membro' : 'Novo Membro'}
                  </DialogTitle>
                </DialogHeader>
                <MemberForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Básico Mensal">Básico</SelectItem>
                  <SelectItem value="Premium Mensal">Premium</SelectItem>
                  <SelectItem value="Anual Premium">Anual</SelectItem>
                  <SelectItem value="Estudante">Estudante</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Membros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar>
                    <AvatarImage src={member.photo} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(member.status)}
                      <Badge variant="outline" className="text-xs">{member.qrCode}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span>{member.plan}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span>{member.totalCheckIns} check-ins</span>
                  </div>
                  {member.lastCheckIn && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Último: {format(member.lastCheckIn, 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMember(member)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditMember(member)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{members.length}</div>
              <div className="text-sm text-gray-600">Total de Membros</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {members.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Membros Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {members.filter(m => m.status === 'suspended').length}
              </div>
              <div className="text-sm text-gray-600">Suspensos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {members.reduce((acc, m) => acc + m.totalCheckIns, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Check-ins</div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Detalhes do Membro */}
        <Dialog open={showMemberDetail} onOpenChange={setShowMemberDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Membro</DialogTitle>
            </DialogHeader>
            {selectedMember && <MemberDetail member={selectedMember} />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Members;
