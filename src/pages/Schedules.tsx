import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Plus, Users, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ClassForm from '@/components/schedules/ClassForm';
import ReservationForm from '@/components/schedules/ReservationForm';
import { getClasses } from '@/lib/api';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TableRowActions } from '@/components/common/TableRowActions';

interface ClassType {
  id: string;
  name: string;
  description: string;
  duration: number; // em minutos
  maxCapacity: number;
  level: 'iniciante' | 'intermediario' | 'avancado';
  equipment: string[];
  color: string;
}

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  experience: number; // anos
  rating: number;
  photo?: string;
  bio: string;
  certifications: string[];
}

interface ClassSchedule {
  id: string;
  classTypeId: string;
  instructorId: string;
  dayOfWeek: number; // 0 = domingo, 1 = segunda, etc.
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
  isActive: boolean;
  enrolledMembers: string[];
  waitingList: string[];
  attendance: ClassAttendance[];
}

interface ClassAttendance {
  id: string;
  scheduleId: string;
  date: Date;
  memberId: string;
  memberName: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
}

interface ClassReservation {
  id: string;
  scheduleId: string;
  memberId: string;
  memberName: string;
  date: Date;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  reservationDate: Date;
}

const Schedules = () => {
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [reservations, setReservations] = useState<ClassReservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [showClassForm, setShowClassForm] = useState(false);
  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);

  const daysOfWeek = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const data = await getClasses();
    setSchedules(data);
  };

  const handleOpenReservation = (classItem) => {
    setSelectedSchedule(classItem);
    setShowAttendance(true);
  };

  const handleClassSuccess = () => {
    setShowClassForm(false);
    fetchClasses();
  };

  const handleReservationSuccess = () => {
    setShowAttendance(false);
    setSelectedSchedule(null);
  };

  // Group classes by day of week
  const classesByDay = daysOfWeek.map(day => ({
    day,
    classes: schedules.filter(c => c.day_of_week === day)
  }));

  const formatTimeRange = (startTime, endTime) => {
    return `${format(new Date(`1970-01-01T${startTime}`), 'HH:mm')} - ${format(new Date(`1970-01-01T${endTime}`), 'HH:mm')}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek];
  };

  const getClassType = (id: string) => classTypes.find(ct => ct.id === id);
  const getInstructor = (id: string) => instructors.find(i => i.id === id);

  const getLevelBadge = (level: string) => {
    const colors = {
      'iniciante': 'bg-green-100 text-green-800',
      'intermediario': 'bg-yellow-100 text-yellow-800',
      'avancado': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[level as keyof typeof colors]}>{level}</Badge>;
  };

  const WeeklySchedule = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Semana de {format(weekStart, 'dd/MM', { locale: ptBR })} a {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: ptBR })}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
              ← Anterior
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
              Próxima →
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const daySchedules = schedules.filter(s => s.dayOfWeek === (index + 1) % 7 && s.isActive);
            
            return (
              <Card key={index} className="min-h-[200px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">
                    {format(day, 'EEE', { locale: ptBR })}
                    <br />
                    {format(day, 'dd/MM')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                  {daySchedules.map(schedule => {
                    const classType = getClassType(schedule.classTypeId);
                    const instructor = getInstructor(schedule.instructorId);
                    
                    return (
                      <div
                        key={schedule.id}
                        className="p-2 rounded text-xs cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: classType?.color + '20', borderLeft: `3px solid ${classType?.color}` }}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowAttendance(true);
                        }}
                      >
                        <div className="font-medium">{classType?.name}</div>
                        <div className="text-gray-600">{schedule.startTime} - {schedule.endTime}</div>
                        <div className="text-gray-600">{instructor?.name}</div>
                        <div className="text-gray-600">{schedule.room}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span>{schedule.enrolledMembers.length}/{classType?.maxCapacity}</span>
                          {schedule.waitingList.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              +{schedule.waitingList.length} espera
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const ClassForm = () => {
    const [formData, setFormData] = useState({
      classTypeId: editingClass?.classTypeId || '',
      instructorId: editingClass?.instructorId || '',
      dayOfWeek: editingClass?.dayOfWeek || 1,
      startTime: editingClass?.startTime || '',
      endTime: editingClass?.endTime || '',
      room: editingClass?.room || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const scheduleData: ClassSchedule = {
        id: editingClass?.id || Date.now().toString(),
        classTypeId: formData.classTypeId,
        instructorId: formData.instructorId,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
        isActive: true,
        enrolledMembers: editingClass?.enrolledMembers || [],
        waitingList: editingClass?.waitingList || [],
        attendance: editingClass?.attendance || []
      };

      if (editingClass) {
        setSchedules(schedules.map(s => s.id === editingClass.id ? scheduleData : s));
      } else {
        setSchedules([...schedules, scheduleData]);
      }

      setShowClassForm(false);
      setEditingClass(null);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="classType">Tipo de Aula *</Label>
            <Select value={formData.classTypeId} onValueChange={(value) => setFormData({...formData, classTypeId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {classTypes.map(ct => (
                  <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="instructor">Instrutor *</Label>
            <Select value={formData.instructorId} onValueChange={(value) => setFormData({...formData, instructorId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o instrutor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map(instructor => (
                  <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dayOfWeek">Dia da Semana *</Label>
            <Select value={formData.dayOfWeek.toString()} onValueChange={(value) => setFormData({...formData, dayOfWeek: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Segunda-feira</SelectItem>
                <SelectItem value="2">Terça-feira</SelectItem>
                <SelectItem value="3">Quarta-feira</SelectItem>
                <SelectItem value="4">Quinta-feira</SelectItem>
                <SelectItem value="5">Sexta-feira</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
                <SelectItem value="0">Domingo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="room">Sala *</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => setFormData({...formData, room: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="startTime">Horário de Início *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="endTime">Horário de Fim *</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowClassForm(false)}>
            Cancelar
          </Button>
          <Button type="submit">
            {editingClass ? 'Atualizar' : 'Criar'} Aula
          </Button>
        </div>
      </form>
    );
  };

  const InstructorForm = () => {
    const [formData, setFormData] = useState({
      name: editingInstructor?.name || '',
      email: editingInstructor?.email || '',
      phone: editingInstructor?.phone || '',
      specialties: editingInstructor?.specialties.join(', ') || '',
      experience: editingInstructor?.experience || 0,
      bio: editingInstructor?.bio || '',
      certifications: editingInstructor?.certifications.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const instructorData: Instructor = {
        id: editingInstructor?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialties: formData.specialties.split(',').map(s => s.trim()),
        experience: formData.experience,
        rating: editingInstructor?.rating || 5.0,
        bio: formData.bio,
        certifications: formData.certifications.split(',').map(c => c.trim())
      };

      if (editingInstructor) {
        setInstructors(instructors.map(i => i.id === editingInstructor.id ? instructorData : i));
      } else {
        setInstructors([...instructors, instructorData]);
      }

      setShowInstructorForm(false);
      setEditingInstructor(null);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
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
            <Label htmlFor="experience">Experiência (anos)</Label>
            <Input
              id="experience"
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
          <Input
            id="specialties"
            value={formData.specialties}
            onChange={(e) => setFormData({...formData, specialties: e.target.value})}
            placeholder="Ex: Yoga, Pilates, CrossFit"
          />
        </div>

        <div>
          <Label htmlFor="certifications">Certificações (separadas por vírgula)</Label>
          <Input
            id="certifications"
            value={formData.certifications}
            onChange={(e) => setFormData({...formData, certifications: e.target.value})}
            placeholder="Ex: Yoga Alliance, CrossFit Level 1"
          />
        </div>

        <div>
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Breve descrição sobre o instrutor..."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setShowInstructorForm(false)}>
            Cancelar
          </Button>
          <Button type="submit">
            {editingInstructor ? 'Atualizar' : 'Adicionar'} Instrutor
          </Button>
        </div>
      </form>
    );
  };

  return (
    <MainLayout title="Agendamentos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Agendamentos</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button onClick={() => setShowClassForm(true)}>
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
                <WeeklySchedule />
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
                {schedules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nenhuma aula encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedules
                      .sort((a, b) => {
                        const dayOrder = daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week);
                        if (dayOrder !== 0) return dayOrder;
                        return a.start_time.localeCompare(b.start_time);
                      })
                      .map(classItem => (
                        <div 
                          key={classItem.id} 
                          className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
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
                            <TableRowActions
                              onView={() => handleOpenReservation(classItem)}
                              onEdit={() => {
                                setEditingClass(classItem);
                                setShowClassForm(true);
                              }}
                              customActions={[
                                {
                                  label: "Reservar",
                                  icon: Users,
                                  onClick: () => handleOpenReservation(classItem)
                                }
                              ]}
                            />
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
      
      <Dialog open={showClassForm} onOpenChange={setShowClassForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
          </DialogHeader>
          <ClassForm onSuccess={handleClassSuccess} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Aula</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{getClassType(selectedSchedule.classTypeId)?.name}</p>
                  <p className="text-sm text-gray-600">{getInstructor(selectedSchedule.instructorId)?.name}</p>
                  <p className="text-sm text-gray-600">{getDayName(selectedSchedule.dayOfWeek)} {selectedSchedule.startTime}</p>
                  <p className="text-sm text-gray-600">{selectedSchedule.room}</p>
                </div>
                <div>
                  <p className="font-medium">Ocupação: {selectedSchedule.enrolledMembers.length}/{getClassType(selectedSchedule.classTypeId)?.maxCapacity}</p>
                  {selectedSchedule.waitingList.length > 0 && (
                    <p className="text-sm text-gray-600">Lista de espera: {selectedSchedule.waitingList.length}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Membros Inscritos:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {selectedSchedule.enrolledMembers.map((memberId, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Membro {memberId}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSchedule.waitingList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Lista de Espera:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedSchedule.waitingList.map((memberId, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span>Membro {memberId}</span>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Schedules;
