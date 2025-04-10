
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

interface PlanMembersProps {
  planId: string;
  planName: string;
}

const PlanMembers: React.FC<PlanMembersProps> = ({ planId, planName }) => {
  const [members, setMembers] = useState<Row<"members">[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      if (planId) {
        const data = await getMembersWithPlan(planId);
        setMembers(data);
        setLoading(false);
      }
    };

    fetchMembers();
  }, [planId]);

  const handleMemberClick = (memberId: string) => {
    navigate(`/members`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Membros com o Plano {planName} ({members.length})
      </h3>
      
      {members.length === 0 ? (
        <div className="text-center p-6 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">
            Nenhum membro encontrado com este plano.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data de Inscrição</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      member.status === 'Ativo' ? 'default' : 
                      member.status === 'Inativo' ? 'destructive' : 
                      'outline'
                    }>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.join_date 
                      ? new Date(member.join_date).toLocaleDateString() 
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleMemberClick(member.id)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PlanMembers;
