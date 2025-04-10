
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const ScheduleCard = ({ title, time, instructor, participants, maxParticipants, color = "bg-primary" }) => (
  <div className={`p-4 rounded-lg border ${color}/10 hover:shadow-md transition-shadow`}>
    <div className={`w-2 h-10 ${color} rounded-full absolute left-0 top-4 ml-4`}></div>
    <h4 className="font-semibold">{title}</h4>
    <p className="text-sm text-muted-foreground">{time}</p>
    <p className="text-sm mt-1">Instrutor: {instructor}</p>
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-muted-foreground">{participants}/{maxParticipants} participantes</span>
      <Button variant="outline" size="sm">Reservar</Button>
    </div>
  </div>
);

const Schedules = () => {
  // Horário semanal - dias da semana
  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  return (
    <MainLayout title="Agendamentos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Agendamento de Aulas</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendário Semanal</CardTitle>
            <CardDescription>
              Visualize e gerencie as aulas programadas para a semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {weekDays.map((day, dayIndex) => (
                <div key={day} className="flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 text-center">{day}</h3>
                  <div className="flex-1 flex flex-col gap-3">
                    {dayIndex === 0 && (
                      <>
                        <div className="relative">
                          <ScheduleCard 
                            title="Yoga Matinal" 
                            time="08:00 - 09:00" 
                            instructor="Ana Maria" 
                            participants={12} 
                            maxParticipants={15}
                            color="bg-indigo-500"
                          />
                        </div>
                        <div className="relative">
                          <ScheduleCard 
                            title="Cross Training" 
                            time="18:30 - 19:30" 
                            instructor="Pedro Costa" 
                            participants={18} 
                            maxParticipants={20}
                            color="bg-red-500"
                          />
                        </div>
                      </>
                    )}

                    {dayIndex === 1 && (
                      <div className="relative">
                        <ScheduleCard 
                          title="Pilates" 
                          time="19:00 - 20:00" 
                          instructor="Sofia Langa" 
                          participants={10} 
                          maxParticipants={15}
                          color="bg-blue-500"
                        />
                      </div>
                    )}

                    {dayIndex === 2 && (
                      <>
                        <div className="relative">
                          <ScheduleCard 
                            title="Spinning" 
                            time="07:30 - 08:30" 
                            instructor="João Silva" 
                            participants={15} 
                            maxParticipants={20} 
                            color="bg-orange-500"
                          />
                        </div>
                        <div className="relative">
                          <ScheduleCard 
                            title="Boxe" 
                            time="19:30 - 20:30" 
                            instructor="Carlos Nuvunga" 
                            participants={8} 
                            maxParticipants={12} 
                            color="bg-purple-500"
                          />
                        </div>
                      </>
                    )}

                    {dayIndex === 3 && (
                      <div className="relative">
                        <ScheduleCard 
                          title="Zumba" 
                          time="18:00 - 19:00" 
                          instructor="Maria Costa" 
                          participants={20} 
                          maxParticipants={25} 
                          color="bg-pink-500"
                        />
                      </div>
                    )}

                    {dayIndex === 4 && (
                      <>
                        <div className="relative">
                          <ScheduleCard 
                            title="HIIT" 
                            time="07:00 - 07:45" 
                            instructor="Pedro Machava" 
                            participants={12} 
                            maxParticipants={15} 
                            color="bg-amber-500"
                          />
                        </div>
                        <div className="relative">
                          <ScheduleCard 
                            title="Dança" 
                            time="18:30 - 19:30" 
                            instructor="Ana Fonseca" 
                            participants={15} 
                            maxParticipants={20} 
                            color="bg-emerald-500"
                          />
                        </div>
                      </>
                    )}

                    {dayIndex === 5 && (
                      <div className="relative">
                        <ScheduleCard 
                          title="Yoga Relaxante" 
                          time="10:00 - 11:00" 
                          instructor="Sofia Langa" 
                          participants={8} 
                          maxParticipants={15} 
                          color="bg-teal-500"
                        />
                      </div>
                    )}

                    {/* Espaço vazio para mostrar altura consistente */}
                    <div className="h-24 border border-dashed rounded-lg flex items-center justify-center p-4">
                      <span className="text-xs text-muted-foreground text-center">Vazio</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Schedules;
