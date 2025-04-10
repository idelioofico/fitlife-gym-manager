
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow } from "@/types/database.types";
import { Edit, Users, ToggleLeft, ToggleRight } from "lucide-react";

interface PlanCardProps {
  plan: TableRow<"plans">;
  onEdit: (plan: TableRow<"plans">) => void;
  onToggleStatus: (plan: TableRow<"plans">, status: boolean) => void;
  onViewMembers: (plan: TableRow<"plans">) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  onEdit, 
  onToggleStatus, 
  onViewMembers 
}) => {
  const parseFeaturesArray = (features: any): string[] => {
    if (!features) return [];
    if (typeof features === "string") {
      try {
        return JSON.parse(features);
      } catch {
        return [];
      }
    }
    return Array.isArray(features) ? features : [];
  };

  const featuresArray = parseFeaturesArray(plan.features);

  return (
    <Card className={`${!plan.is_active ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <Badge variant={plan.is_active ? "default" : "secondary"}>
            {plan.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <div className="text-xl font-bold">
          {plan.price.toLocaleString('pt-BR')} MZN
          <span className="text-sm font-normal text-muted-foreground"> / {plan.duration_days} dias</span>
        </div>
        {featuresArray.length > 0 && (
          <ul className="list-disc list-inside space-y-1">
            {featuresArray.map((feature, index) => (
              <li key={index} className="text-sm">{feature}</li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(plan)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewMembers(plan)}
          >
            <Users className="h-4 w-4 mr-1" />
            Membros
          </Button>
        </div>
        <Button 
          size="sm" 
          variant={plan.is_active ? "ghost" : "outline"}
          onClick={() => onToggleStatus(plan, !plan.is_active)}
        >
          {plan.is_active ? (
            <>
              <ToggleLeft className="h-4 w-4 mr-1" />
              Desativar
            </>
          ) : (
            <>
              <ToggleRight className="h-4 w-4 mr-1" />
              Ativar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
