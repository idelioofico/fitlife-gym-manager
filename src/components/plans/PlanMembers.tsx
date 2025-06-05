import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMembersWithPlan } from "@/lib/api";
import { TableRow as Row } from "@/types/database.types";
import { ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PlanMembersProps {
  planId: string;
  planName: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  start_date: string;
  end_date: string;
}

const PlanMembers: React.FC<PlanMembersProps> = ({ planId, planName }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembersWithPlan(planId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros do plano.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchMembers();
    }
  }, [planId]);

  const handleMemberClick = (memberId: string) => {
    navigate(`/members`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'default';
      case 'Inativo':
        return 'destructive';
      case 'Pendente':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membros do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando membros...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membros do Plano</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p>Nenhum membro encontrado neste plano.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead>Data de Término</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(member.status)}>
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(member.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(member.end_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanMembers;
