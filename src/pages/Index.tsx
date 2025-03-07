import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Award, Clock, BookOpen, CalendarCheck, HelpCircle, FileText } from 'lucide-react';

const Index = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Capitalize first letter
  const formattedDate = currentDate.charAt(0).toUpperCase() + currentDate.slice(1);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta, Aluno!</h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Progresso Geral</CardTitle>
            <CardDescription>Você completou 65% do curso</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={65} className="h-2" />
            <div className="mt-2 flex justify-between text-sm">
              <span>0%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Streak Atual</CardTitle>
            <CardDescription>Mantenha sua sequência diária</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">7 dias</p>
              <p className="text-sm text-muted-foreground">Continue assim!</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Pontuação</CardTitle>
            <CardDescription>Seus pontos acumulados</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">2.475</p>
              <p className="text-sm text-muted-foreground">pontos</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Atividade Recomendada</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Quiz: Conhecimentos Gerais</h3>
              <p className="text-muted-foreground">Teste seus conhecimentos com nosso quiz interativo.</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>10 minutos</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full micro-bounce">
              Iniciar Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Redação da Semana</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Impactos da Tecnologia na Educação</h3>
              <p className="text-muted-foreground">Escreva uma redação sobre como a tecnologia está transformando a educação.</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Prazo: 5 dias</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full micro-bounce">
              Iniciar Redação
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Seu histórico de atividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Completou o Quiz de Matemática', date: 'Ontem, 15:30', icon: HelpCircle, score: '8/10' },
                { title: 'Enviou Redação: A Importância da Leitura', date: 'Há 2 dias, 10:15', icon: FileText, score: 'Avaliando' },
                { title: 'Completou o Quiz de História', date: 'Há 3 dias, 14:45', icon: HelpCircle, score: '9/10' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 py-2 border-b last:border-0">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <activity.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className="text-sm font-medium">{activity.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
