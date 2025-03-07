import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  BarChart2, 
  TrendingUp, 
  Award, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  FileText,
  Loader2
} from 'lucide-react';
import { useProgress, QuizResult, Essay } from '@/hooks/useProgress';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ActivityChart = ({ data }: { data: { day: string, value: number }[] }) => {
  return (
    <div className="w-full h-64 flex items-end justify-between px-2">
      {data.map((item, index) => (
        <div key={index} className="relative h-full flex items-end">
          <div 
            className="w-10 rounded-t-md bg-primary/80 hover:bg-primary transition-all duration-200"
            style={{ height: `${item.value}%` }}
          ></div>
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs">
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const prepareWeeklyActivityData = (quizResults: QuizResult[], essays: Essay[]) => {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));
    return {
      date,
      day: dayNames[date.getDay()],
      value: 0
    };
  });

  const allActivities = [
    ...quizResults.map(q => ({ date: parseISO(q.created_at), type: 'quiz' })),
    ...essays.map(e => ({ date: parseISO(e.created_at), type: 'essay' }))
  ];

  const recentActivities = allActivities.filter(activity => {
    const activityDate = activity.date;
    const daysAgo = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo < 7;
  });

  recentActivities.forEach(activity => {
    const dayOfWeek = activity.date.getDay();
    const dayIndex = weekDays.findIndex(day => day.day === dayNames[dayOfWeek]);
    if (dayIndex !== -1) {
      weekDays[dayIndex].value += 25;
    }
  });

  weekDays.forEach(day => {
    if (day.value > 100) day.value = 100;
    if (day.value === 0) day.value = 10;
  });

  return weekDays;
};

const Progress_Page = () => {
  const { quizResults, essays, loading } = useProgress();
  const [activityData] = useState<{ day: string, value: number }[]>([]);

  const weeklyActivityData = prepareWeeklyActivityData(quizResults, essays);

  const completedQuizzes = quizResults.length;
  const submittedEssays = essays.length;
  const totalPoints = quizResults.reduce((total, quiz) => total + quiz.score, 0);

  const calculateStreak = () => {
    const allActivities = [
      ...quizResults.map(q => parseISO(q.created_at)),
      ...essays.map(e => parseISO(e.created_at))
    ].sort((a, b) => b.getTime() - a.getTime());

    if (allActivities.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    const hasActivityToday = allActivities.some(date => {
      const activityDate = new Date(date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    });

    if (hasActivityToday) {
      streak = 1;

      for (let i = 1; i <= 30; i++) {
        currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);

        const hasActivityOnDay = allActivities.some(date => {
          const activityDate = new Date(date);
          activityDate.setHours(0, 0, 0, 0);
          return activityDate.getTime() === currentDate.getTime();
        });

        if (hasActivityOnDay) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const extractSubjects = () => {
    const subjectCounts: Record<string, { count: number, correct: number, total: number }> = {};

    quizResults.forEach(quiz => {
      const subject = quiz.quiz_name.split(':')[0]?.trim() || quiz.quiz_name;

      if (!subjectCounts[subject]) {
        subjectCounts[subject] = { count: 0, correct: 0, total: 0 };
      }

      subjectCounts[subject].count += 1;
      subjectCounts[subject].correct += quiz.score;
      subjectCounts[subject].total += quiz.total_questions;
    });

    return Object.entries(subjectCounts).map(([subject, data]) => ({
      subject,
      progress: Math.round((data.correct / data.total) * 100) || 0
    }));
  };

  const subjectProgress = extractSubjects();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando seu progresso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Progresso</h1>
        <p className="text-muted-foreground">Acompanhe sua evolução e desempenho</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Quiz Concluídos', value: completedQuizzes.toString(), icon: HelpCircle, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
          { title: 'Redações Enviadas', value: submittedEssays.toString(), icon: FileText, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
          { title: 'Pontuação Total', value: totalPoints.toString(), icon: Award, color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
          { title: 'Streak Atual', value: `${currentStreak} dias`, icon: Calendar, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
        ].map((stat, index) => (
          <Card key={index} className="hover-lift">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 gap-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Desempenho
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart className="h-5 w-5 text-primary" />
                  <span>Atividade Semanal</span>
                </CardTitle>
                <CardDescription>
                  Seu progresso durante esta semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityChart data={weeklyActivityData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso do Curso</CardTitle>
                <CardDescription>
                  Seu avanço nas diferentes matérias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectProgress.length > 0 ? (
                  subjectProgress.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-muted-foreground">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum quiz completado ainda.</p>
                    <p className="text-sm mt-2">Complete quizzes para ver seu progresso por matéria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Desempenho</CardTitle>
              <CardDescription>
                Seu progresso detalhado em atividades e avaliações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <span>Desempenho em Quizzes</span>
                  </h3>
                  {quizResults.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Quiz</th>
                            <th className="text-center p-3 font-medium">Data</th>
                            <th className="text-center p-3 font-medium">Pontuação</th>
                            <th className="text-center p-3 font-medium">Tempo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quizResults.slice(0, 5).map((quiz, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{quiz.quiz_name}</td>
                              <td className="p-3 text-center">
                                {format(parseISO(quiz.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </td>
                              <td className="p-3 text-center">{`${quiz.score}/${quiz.total_questions}`}</td>
                              <td className="p-3 text-center">{formatTime(quiz.time_spent)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <p>Nenhum quiz completado ainda.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Desempenho em Redações</span>
                  </h3>
                  {essays.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Tema</th>
                            <th className="text-center p-3 font-medium">Data</th>
                            <th className="text-center p-3 font-medium">Nota</th>
                          </tr>
                        </thead>
                        <tbody>
                          {essays.slice(0, 5).map((essay, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{essay.title}</td>
                              <td className="p-3 text-center">
                                {format(parseISO(essay.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                              </td>
                              <td className="p-3 text-center">
                                {essay.status === 'evaluated' 
                                  ? `${essay.score}/1000` 
                                  : 'Avaliando'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <p>Nenhuma redação enviada ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>
                Todas as suas atividades recentes na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizResults.length > 0 || essays.length > 0 ? (
                <div className="space-y-6">
                  {(() => {
                    const allActivities = [
                      ...quizResults.map(quiz => ({
                        type: 'quiz',
                        date: parseISO(quiz.created_at),
                        data: quiz
                      })),
                      ...essays.map(essay => ({
                        type: 'essay',
                        date: parseISO(essay.created_at),
                        data: essay
                      }))
                    ].sort((a, b) => b.date.getTime() - a.date.getTime());

                    const groupedActivities: Record<string, typeof allActivities> = {};

                    allActivities.forEach(activity => {
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);

                      let dateKey;
                      if (activity.date.toDateString() === today.toDateString()) {
                        dateKey = 'Hoje';
                      } else if (activity.date.toDateString() === yesterday.toDateString()) {
                        dateKey = 'Ontem';
                      } else {
                        dateKey = format(activity.date, 'dd/MM/yyyy', { locale: ptBR });
                      }

                      if (!groupedActivities[dateKey]) {
                        groupedActivities[dateKey] = [];
                      }

                      groupedActivities[dateKey].push(activity);
                    });

                    return Object.entries(groupedActivities).map(([dateKey, activities], dayIndex) => (
                      <div key={dayIndex} className="space-y-3">
                        <h3 className="font-medium text-sm text-muted-foreground">{dateKey}</h3>
                        <div className="relative border-l-2 border-muted pl-6 ml-2 space-y-6">
                          {activities.map((activity, actIndex) => {
                            const time = format(activity.date, 'HH:mm');
                            let desc = '';

                            if (activity.type === 'quiz') {
                              const quiz = activity.data as QuizResult;
                              desc = `Completou Quiz: ${quiz.quiz_name}`;
                            } else {
                              const essay = activity.data as Essay;
                              desc = `Enviou Redação: ${essay.title}`;
                            }

                            return (
                              <div key={actIndex} className="relative">
                                <div className="absolute -left-[30px] mt-1 h-4 w-4 rounded-full bg-primary"></div>
                                <div className="flex items-start">
                                  <span className="text-sm text-muted-foreground w-16">{time}</span>
                                  <span>{desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>Nenhuma atividade registrada ainda.</p>
                  <p className="text-sm mt-2">Complete quizzes e redações para ver seu histórico de atividades.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Progress_Page;
