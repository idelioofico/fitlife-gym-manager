
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Ban, Edit, Eye, MoreHorizontal, RotateCcw } from 'lucide-react';

interface ActionProps {
  onView?: () => void;
  onEdit?: () => void;
  onRenew?: () => void;
  onHistory?: () => void;
  onDeactivate?: () => void;
  customActions?: Array<{
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    destructive?: boolean;
  }>;
}

export function TableRowActions({ 
  onView, 
  onEdit, 
  onRenew, 
  onHistory, 
  onDeactivate,
  customActions 
}: ActionProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
          </DropdownMenuItem>
        )}
        
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
        )}
        
        {onRenew && (
          <DropdownMenuItem onClick={onRenew}>
            <RotateCcw className="mr-2 h-4 w-4" /> Renovar Plano
          </DropdownMenuItem>
        )}
        
        {onHistory && (
          <DropdownMenuItem onClick={onHistory}>
            <Eye className="mr-2 h-4 w-4" /> Ver Histórico
          </DropdownMenuItem>
        )}
        
        {customActions && customActions.map((action, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={action.onClick}
            className={action.destructive ? "text-red-600" : ""}
          >
            <action.icon className="mr-2 h-4 w-4" /> {action.label}
          </DropdownMenuItem>
        ))}
        
        {onDeactivate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDeactivate}
              className="text-red-600"
            >
              <Ban className="mr-2 h-4 w-4" /> Desativar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
