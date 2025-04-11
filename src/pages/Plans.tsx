
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPlans, togglePlanStatus } from '@/lib/api';
import { TableRow } from '@/types/database.types';
import PlanForm from '@/components/plans/PlanForm';
import PlanCard from '@/components/plans/PlanCard';
import PlanMembers from '@/components/plans/PlanMembers';

const Plans = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<TableRow<"plans">[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetContent, setSheetContent] = useState<{type: string; plan?: TableRow<"plans">} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{plan: TableRow<"plans">; action: string} | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const data = await getPlans();
    setPlans(data);
    setLoading(false);
  };

  const handleAddPlan = () => {
    setSheetContent({type: 'add'});
  };

  const handleEditPlan = (plan: TableRow<"plans">) => {
    setSheetContent({type: 'edit', plan});
  };

  const handleViewMembers = (plan: TableRow<"plans">) => {
    setSheetContent({type: 'members', plan});
  };

  const handleToggleStatus = (plan: TableRow<"plans">, newStatus: boolean) => {
    setConfirmDialog({
      plan, 
      action: newStatus ? 'activate' : 'deactivate'
    });
  };

  const confirmToggleStatus = async () => {
    if (!confirmDialog) return;
    
    const { plan, action } = confirmDialog;
    const newStatus = action === 'activate';
    
    try {
      await togglePlanStatus(plan.id, newStatus);
      setPlans(plans.map(p => p.id === plan.id ? {...p, is_active: newStatus} : p));
      setConfirmDialog(null);
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o estado do plano.",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setSheetContent(null);
    fetchPlans();
  };

  const renderSheetContent = () => {
    if (!sheetContent) return null;
    
    switch (sheetContent.type) {
      case 'add':
        return (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle>Adicionar Novo Plano</SheetTitle>
              <SheetDescription>
                Crie um novo plano de adesão para os utentes do ginásio
              </SheetDescription>
            </SheetHeader>
            <PlanForm onSuccess={handleFormSuccess} onCancel={() => setSheetContent(null)} />
          </>
        );
      case 'edit':
        return (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle>Editar Plano</SheetTitle>
              <SheetDescription>
                Modifique os detalhes do plano existente
              </SheetDescription>
            </SheetHeader>
            <PlanForm 
              initialData={sheetContent.plan} 
              isEditing 
              onSuccess={handleFormSuccess} 
              onCancel={() => setSheetContent(null)} 
            />
          </>
        );
      case 'members':
        return (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle>Membros com este Plano</SheetTitle>
              <SheetDescription>
                Lista de utentes com o plano {sheetContent.plan?.name}
              </SheetDescription>
            </SheetHeader>
            <PlanMembers 
              planId={sheetContent.plan?.id ?? ""} 
              planName={sheetContent.plan?.name ?? ""} 
            />
          </>
        );
      default:
        return null;
    }
  };

  const renderPlansGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-md p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              <div className="pt-2 flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (plans.length === 0) {
      return (
        <div className="text-center p-6 md:p-10 border rounded-lg">
          <h3 className="text-lg font-medium mb-3">Nenhum Plano Encontrado</h3>
          <p className="text-muted-foreground mb-6">
            Ainda não há planos cadastrados no sistema. Adicione seu primeiro plano agora.
          </p>
          <Button onClick={handleAddPlan}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Plano
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEditPlan}
            onToggleStatus={handleToggleStatus}
            onViewMembers={handleViewMembers}
          />
        ))}
      </div>
    );
  };

  return (
    <MainLayout title="Planos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Planos</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button onClick={handleAddPlan}>
              <Plus className="h-4 w-4 mr-2" /> Novo Plano
            </Button>
          </div>
        </div>
        
        {renderPlansGrid()}
      </div>

      {/* Side panel for forms and member lists */}
      <Sheet 
        open={!!sheetContent} 
        onOpenChange={(open) => !open && setSheetContent(null)}
      >
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          {renderSheetContent()}
        </SheetContent>
      </Sheet>

      {/* Confirmation dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              {confirmDialog?.action === 'activate'
                ? `Deseja ativar o plano "${confirmDialog?.plan.name}"?`
                : `Deseja desativar o plano "${confirmDialog?.plan.name}"?`
              }
              {confirmDialog?.action === 'deactivate' && (
                <p className="mt-2 text-sm font-medium text-destructive">
                  Isso impedirá que novos membros assinem este plano, mas não afetará os membros existentes.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
            >
              Cancelar
            </Button>
            <Button 
              variant={confirmDialog?.action === 'activate' ? 'default' : 'destructive'}
              onClick={confirmToggleStatus}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Plans;
