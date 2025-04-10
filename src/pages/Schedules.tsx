
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClassForm from '@/components/schedules/ClassForm';
import ReservationForm from '@/components/schedules/ReservationForm';
import { getClasses } from '@/lib/api';
import { format } from 'date-fns';

const Schedules = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewClassDialogOpen, setIsNewClassDialogOpen] = useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    const data = await getClasses();
    setClasses(data);
    setLoading(false);
  };

  const handleOpenReservation = (classItem) => {
    setSelectedClass(classItem);
    setIsReservationDialogOpen(true);
  };

  const handleClassSuccess = () => {
    setIsNewClassDialogOpen(false);
    fetchClasses();
  };

  const handleReservationSuccess = () => {
    setIsReservationDialogOpen(false);
    setSelectedClass(null);
  };

  // Group classes by day of week
  const classesByDay = daysOfWeek.map(day => ({
    day,
    classes: classes.filter(c => c.day_of_week === day)
  }));

  const formatTimeRange = (startTime, endTime) => {
    return `${format(new Date(`1970-01-01T${startTime}`), 'HH:mm')} - ${format(new Date(`1970-01-01T${endTime}`), 'HH:mm')}`;
  };

  return (
    <MainLayout title="Agendamentos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Agendamentos</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button onClick={() => setIsNewClassDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </div>

        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">Vista Semanal</TabsTrigger>
            <TabsTrigger value="day">Vista Diária</TabsTrigger>
            <TabsTrigger value="list">Lista de Aulas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="week">
            <Card>
              <CardHeader>
                <CardTitle>Programação Semanal</CardTitle>
                <CardDescription>Todas as aulas da semana</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Carregando aulas...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {classesByDay.map(dayData => (
                      <div key={dayData.day} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-2 text-center font-medium">
                          {dayData.day}
                        </div>
                        <div className="p-2 space-y-2 min-h-[150px]">
                          {dayData.classes.length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground py-4">
                              Sem aulas
                            </div>
                          ) : (
                            dayData.classes
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map(classItem => (
                                <div 
                                  key={classItem.id} 
                                  className={`${classItem.color || 'bg-primary'} text-white p-2 rounded cursor-pointer hover:opacity-90 transition-opacity`}
                                  onClick={() => handleOpenReservation(classItem)}
                                >
                                  <div className="font-medium text-xs sm:text-sm truncate">
                                    {classItem.title}
                                  </div>
                                  <div className="flex justify-between text-xs mt-1">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {formatTimeRange(classItem.start_time, classItem.end_time)}
                                    </span>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="day">
            <Card>
              <CardHeader>
                <CardTitle>Aulas de Hoje</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    A vista diária será implementada em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Aulas</CardTitle>
                <CardDescription>Todas as aulas disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Carregando aulas...</p>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nenhuma aula encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes
                      .sort((a, b) => {
                        const dayOrder = daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week);
                        if (dayOrder !== 0) return dayOrder;
                        return a.start_time.localeCompare(b.start_time);
                      })
                      .map(classItem => (
                        <div 
                          key={classItem.id} 
                          className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleOpenReservation(classItem)}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-12 ${classItem.color || 'bg-primary'} rounded-full mr-4`}></div>
                            <div>
                              <h3 className="font-medium">{classItem.title}</h3>
                              <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center">
                                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                  {classItem.day_of_week}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {formatTimeRange(classItem.start_time, classItem.end_time)}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3.5 w-3.5 mr-1" />
                                  {classItem.max_participants} vagas
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline">{classItem.instructor}</Badge>
                            <Button size="sm" variant="ghost" className="ml-2">
                              Reservar
                            </Button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isNewClassDialogOpen} onOpenChange={setIsNewClassDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
          </DialogHeader>
          <ClassForm onSuccess={handleClassSuccess} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar Aula</DialogTitle>
          </DialogHeader>
          <ReservationForm 
            onSuccess={handleReservationSuccess} 
            currentClass={selectedClass} 
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Schedules;
