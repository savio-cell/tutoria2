import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/hooks/useProgress';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Book,
  CheckCircle,
  Clock,
  Edit,
  FileQuestion,
  MessageSquare,
  PenTool,
  Sparkles,
  User
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user } = useAuth();
  const { essays, quizResults, loading } = useProgress();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Calculate total points from essays and quizzes
  const totalEssayPoints = essays.reduce((sum, essay) => sum + (Number(essay.score) || 0), 0);
  const totalQuizPoints = quizResults.reduce((sum, quiz) => sum + (Number(quiz.score) || 0), 0);
  const totalPoints = totalEssayPoints + totalQuizPoints;
  
  // Calculate progress percentages
  const essaysCompleted = essays.length;
  const quizzesCompleted = quizResults.length;
  const essayCompletionRate = essays.filter(e => e.status === 'evaluated').length / Math.max(essays.length, 1) * 100;
  
  // Calculate average essay score
  const evaluatedEssays = essays.filter(e => e.status === 'evaluated' && e.score !== null);
  const averageEssayScore = evaluatedEssays.length > 0 
    ? evaluatedEssays.reduce((sum, essay) => sum + (Number(essay.score) || 0), 0) / evaluatedEssays.length 
    : 0;
  
  // Calculate average quiz score percentage with proper type checking
  const averageQuizPercentage = quizResults.length > 0 
    ? quizResults.reduce((sum, quiz) => {
        // Ensure both score and total_questions are treated as numbers
        const score = Number(quiz.score) || 0;
        const totalQuestions = Number(quiz.total_questions) || 1; // Avoid division by zero
        return sum + (score / totalQuestions * 100);
      }, 0) / quizResults.length 
    : 0;

  // Generate combined activity feed from essays and quizzes
  useEffect(() => {
    if (!loading) {
      const essayActivities = essays.map(essay => ({
        id: essay.id,
        type: 'essay',
        title: essay.title,
        score: essay.score,
        status: essay.status,
        date: new Date(essay.created_at),
        wordCount: essay.word_count
      }));
      
      const quizActivities = quizResults.map(quiz => ({
        id: quiz.id,
        type: 'quiz',
        title: quiz.quiz_name,
        score: quiz.score,
        total: quiz.total_questions,
        date: new Date(quiz.created_at)
      }));
      
      // Combine and sort activities by date (newest first)
      const combined = [...essayActivities, ...quizActivities].sort((a, b) => b.date - a.date);
      setRecentActivity(combined.slice(0, 5)); // Get 5 most recent activities
    }
  }, [essays, quizResults, loading]);

  // Fetch user info
  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        try {
          const { data, error } = await supabase
            .from('user_info')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user info:', error);
            return;
          }
          
          setUserInfo(data || { id: user.id });
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      
      fetchUserInfo();
    }
  }, [user]);

  const getActivityIcon = (activity: any) => {
    if (activity.type === 'essay') {
      return activity.status === 'evaluated' 
        ? <CheckCircle className="h-4 w-4 text-green-500" /> 
        : <Edit className="h-4 w-4 text-amber-500" />;
    } else {
      // Ensure we're working with numbers for the calculation
      const score = Number(activity.score) || 0;
      const total = Number(activity.total) || 1;
      const percentage = (score / total) * 100;
      
      return percentage >= 70 
        ? <CheckCircle className="h-4 w-4 text-green-500" /> 
        : <FileQuestion className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 w-full h-full">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta! Veja seu progresso e continue seus estudos</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Stats Cards */}
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Pontuação Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-muted-foreground text-sm">
              Redações: {totalEssayPoints.toLocaleString()} | Quizzes: {totalQuizPoints.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Book className="h-4 w-4 text-primary" />
              <span>Redações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{essaysCompleted}</div>
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Taxa de conclusão</span>
                <span>{Math.round(essayCompletionRate)}%</span>
              </div>
              <Progress value={essayCompletionRate} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-primary" />
              <span>Quizzes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{quizzesCompleted}</div>
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Média de acertos</span>
                <span>{Math.round(averageQuizPercentage)}%</span>
              </div>
              <Progress value={averageQuizPercentage} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas últimas atividades na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="h-10 w-10 rounded-full border-t-2 border-primary animate-spin"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {activity.type === 'essay' ? <PenTool className="h-5 w-5" /> : <FileQuestion className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <div className="flex items-center gap-1 text-xs">
                          {getActivityIcon(activity)}
                          <span>
                            {activity.type === 'essay' 
                              ? (activity.status === 'evaluated' ? `${activity.score}/1000` : 'Enviado') 
                              : `${activity.score}/${activity.total}`
                            }
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {activity.date.toLocaleDateString()} • {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {activity.type === 'essay' && (
                        <p className="text-xs">{activity.wordCount} palavras</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma atividade recente encontrada.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/progress')}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Ver Todo o Progresso
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start text-left" 
              onClick={() => navigate('/essay')}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Escrever Nova Redação
            </Button>
            
            <Button 
              className="w-full justify-start text-left" 
              variant="outline"
              onClick={() => navigate('/quiz')}
            >
              <FileQuestion className="h-4 w-4 mr-2" />
              Responder Quiz
            </Button>
            
            <Button 
              className="w-full justify-start text-left" 
              variant="outline"
              onClick={() => navigate('/chat-ai')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Assistente IA
            </Button>
            
            <Button 
              className="w-full justify-start text-left" 
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
