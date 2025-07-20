import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Loader2
} from 'lucide-react';
import { getMembers, createMember, updateMember, getPlans, getGenders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  document?: string;
  gender?: string;
  nr_cartao?: string;
  street?: string;
  city?: string;
  province?: string;
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relationship?: string;
  fitness_goals?: string;
  medical_restrictions?: string;
  plan?: string;
  plan_id?: string;
  status?: string;
  created_at?: string;
  end_date?: string;
}

const MembersFixed = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const { toast } = useToast();

  const loadMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar membros.',
        variant: 'destructive',
      });
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [membersData, plansData, gendersData] = await Promise.all([
        getMembers(),
        getPlans(),
        getGenders()
      ]);
      
      setMembers(membersData);
      setPlans(plansData);
      setGenders(gendersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados iniciais.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberForm(true);
  };

  const handleNewMember = () => {
    setEditingMember(null);
    setShowMemberForm(true);
  };

  const MemberForm = () => {
    const [formData, setFormData] = useState({
      name: editingMember?.name || '',
      email: editingMember?.email || '',
      phone: editingMember?.phone || '',
      document: editingMember?.document || '',
      nr_cartao: editingMember?.nr_cartao || '',
      gender: editingMember?.gender || 'M',
      street: editingMember?.street || '',
      city: editingMember?.city || '',
      province: editingMember?.province || '',
      emergency_name: editingMember?.emergency_name || '',
      emergency_phone: editingMember?.emergency_phone || '',
      emergency_relationship: editingMember?.emergency_relationship || '',
      fitness_goals: editingMember?.fitness_goals || '',
      medical_restrictions: editingMember?.medical_restrictions || '',
      plan: editingMember?.plan_id || (editingMember?.plan ? 
        plans.find(p => p.name === editingMember.plan)?.id || '' : '')
    });

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const apiData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          document: formData.document,
          nr_cartao: formData.nr_cartao,
          gender: formData.gender,
          street: formData.street,
          city: formData.city,
          province: formData.province,
          emergency_name: formData.emergency_name,
          emergency_phone: formData.emergency_phone,
          emergency_relationship: formData.emergency_relationship,
          fitness_goals: formData.fitness_goals,
          medical_restrictions: formData.medical_restrictions,
          plan_id: formData.plan,
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

        await loadMembers();
        setShowMemberForm(false);
        setEditingMember(null);
      } catch (error) {
        console.error('Error saving member:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar membro. Verifique os dados e tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setSubmitting(false);
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
            <Label htmlFor="nr_cartao">Número do Cartão</Label>
            <Input
              id="nr_cartao"
              value={formData.nr_cartao}
              onChange={(e) => setFormData({...formData, nr_cartao: e.target.value})}
              placeholder="Ex: GYM001, 12345, FIT-2024-001"
              maxLength={20}
            />
          </div>
          <div>
            <Label htmlFor="document">Documento de Identidade</Label>
            <Input
              id="document"
              value={formData.document}
              onChange={(e) => setFormData({...formData, document: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um gênero" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.code} value={gender.code}>
                    {gender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="plan">Plano</Label>
            <Select value={formData.plan} onValueChange={(value) => setFormData({...formData, plan: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.price} MZN / {plan.duration_days} dias
                  </SelectItem>
                ))}
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
              <Label htmlFor="emergency_name">Nome</Label>
              <Input
                id="emergency_name"
                value={formData.emergency_name}
                onChange={(e) => setFormData({...formData, emergency_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emergency_phone">Telefone</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_phone}
                onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emergency_relationship">Parentesco</Label>
              <Input
                id="emergency_relationship"
                value={formData.emergency_relationship}
                onChange={(e) => setFormData({...formData, emergency_relationship: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="fitness_goals">Objetivos Fitness</Label>
          <Input
            id="fitness_goals"
            value={formData.fitness_goals}
            onChange={(e) => setFormData({...formData, fitness_goals: e.target.value})}
            placeholder="Ex: Perda de peso, Ganho de massa muscular"
          />
        </div>

        <div>
          <Label htmlFor="medical_restrictions">Restrições Médicas</Label>
          <Textarea
            id="medical_restrictions"
            value={formData.medical_restrictions}
            onChange={(e) => setFormData({...formData, medical_restrictions: e.target.value})}
            placeholder="Descreva qualquer restrição médica ou digite 'Nenhuma'"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowMemberForm(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              editingMember ? 'Atualizar' : 'Cadastrar'
            )}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Membros</h1>
            <p className="text-muted-foreground">Gerencie os membros da academia</p>
          </div>
          <Dialog open={showMemberForm} onOpenChange={setShowMemberForm}>
            <DialogTrigger asChild>
              <Button onClick={handleNewMember}>
                <Plus className="mr-2 h-4 w-4" />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar membros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {member.phone}
                        </div>
                        {member.nr_cartao && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            Cartão: {member.nr_cartao}
                          </div>
                        )}
                        {member.city && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            {member.city}, {member.province}
                          </div>
                        )}
                        <div className="mt-2">
                          <Badge variant="outline">{member.plan}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MembersFixed; 