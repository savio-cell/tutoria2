import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  HelpCircle, 
  Clock, 
  Award, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCw,
  Sparkles,
  Brain,
  Book,
  Home,
  Loader2
} from 'lucide-react';
import { toast } from "sonner";
import { useProgress } from '@/hooks/useProgress';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const Quiz = () => {
  const { addQuizResult } = useProgress();
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('médio');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [quizResultSaved, setQuizResultSaved] = useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnsweredQuestions({});
    setShowExplanation(false);
    setQuizCompleted(false);
    setProgress(0);
    setQuizStartTime(new Date());
    setQuizEndTime(null);
    setTimeSpent(0);
    setQuizResultSaved(false);
  };

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.error("Por favor, insira um assunto para o quiz.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prompt em português com instruções específicas
      const prompt = `Por favor, gere ${questionCount} questões de múltipla escolha em português sobre o tema "${topic}" com nível de dificuldade ${difficulty}. 

Requisitos:
- Cada questão deve ter 4 alternativas (A, B, C, D)
- Forneça a resposta correta para cada questão
- Inclua uma explicação clara e didática para a resposta correta
- Use linguagem formal e apropriada para contexto educacional
- Mantenha as perguntas relevantes ao nível de dificuldade solicitado
- Todas as questões devem estar em português do Brasil
- Evite anglicismos ou termos em outros idiomas, exceto quando necessário

Formato desejado para cada questão:
1. Enunciado da questão
2. Alternativas A, B, C, D
3. Resposta correta
4. Explicação detalhada da resposta`;
      
      // Chamada para a função AI
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt,
          type: 'quiz',
          language: 'pt-BR' // Adicionando especificação explícita do idioma
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error("Erro ao gerar o quiz: " + data.error);
        return;
      }

      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        toast.success("Quiz gerado com sucesso!");
        startQuiz();
      } else {
        toast.error("Não foi possível gerar as questões. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar quiz:", error);
      toast.error("Erro ao gerar o quiz. Tente novamente mais tarde.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const answeredCount = Object.keys(answeredQuestions).length;
      const newProgress = Math.round((answeredCount / quizQuestions.length) * 100);
      setProgress(newProgress);
    }
  }, [answeredQuestions, quizQuestions.length, quizStarted, quizCompleted]);

  useEffect(() => {
    let timer: number;
    
    if (quizStarted && !quizCompleted && !quizEndTime) {
      if (!quizStartTime) {
        setQuizStartTime(new Date());
      }
      
      timer = window.setInterval(() => {
        if (quizStartTime) {
          const now = new Date();
          const diff = now.getTime() - quizStartTime.getTime();
          setTimeSpent(Math.floor(diff / 1000)); // in seconds
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, quizCompleted, quizStartTime, quizEndTime]);

  const handleOptionSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
    setAnsweredQuestions(prev => ({
      ...prev,
      [currentQuestion]: option
    }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answeredQuestions[currentQuestion + 1] || null);
      setShowExplanation(!!answeredQuestions[currentQuestion + 1]);
    } else {
      setQuizCompleted(true);
      setQuizEndTime(new Date());
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answeredQuestions[currentQuestion - 1] || null);
      setShowExplanation(!!answeredQuestions[currentQuestion - 1]);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const calculateScore = () => {
    let correctCount = 0;
    Object.entries(answeredQuestions).forEach(([questionIdx, answer]) => {
      if (quizQuestions[parseInt(questionIdx)].correctAnswer === answer) {
        correctCount++;
      }
    });
    return {
      correct: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100)
    };
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const saveQuizResult = async () => {
      if (quizCompleted && quizStartTime && !quizResultSaved && quizQuestions.length > 0) {
        setQuizResultSaved(true); // Prevent multiple saves
        
        const score = calculateScore();
        const timeSpentInSeconds = Math.floor(
          ((quizEndTime?.getTime() || new Date().getTime()) - quizStartTime.getTime()) / 1000
        );
        
        try {
          await addQuizResult(
            topic || "Quiz Gerado por IA",
            score.correct,
            quizQuestions.length,
            timeSpentInSeconds
          );
          console.log("Quiz result saved successfully");
        } catch (error) {
          console.error("Error saving quiz result:", error);
        }
      }
    };
    
    saveQuizResult();
  }, [quizCompleted, quizStartTime, quizEndTime, addQuizResult, quizResultSaved, quizQuestions.length, topic]);

  const renderQuizStart = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Geração de Quiz por IA</CardTitle>
        <CardDescription>Crie um quiz personalizado com inteligência artificial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Assunto do Quiz</Label>
            <Input 
              id="topic" 
              placeholder="Ex: História do Brasil, Matemática Básica, Ciências..." 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCount">Número de Perguntas</Label>
              <Input 
                id="questionCount" 
                type="number" 
                min={1} 
                max={10} 
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Nível de Dificuldade</Label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fácil">Fácil</SelectItem>
                  <SelectItem value="médio">Médio</SelectItem>
                  <SelectItem value="difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full micro-bounce" 
          size="lg" 
          onClick={generateQuiz}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Gerando Quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Quiz com IA
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderGeneratingQuiz = () => (
    <Card className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <CardTitle className="text-2xl">Gerando seu Quiz</CardTitle>
        <CardDescription>Nossa IA está criando perguntas personalizadas sobre {topic}</CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="h-2 w-full max-w-md bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse-slow rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p>Preparando {questionCount} perguntas de nível {difficulty}</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuizQuestion = () => {
    const question = quizQuestions[currentQuestion];
    if (!question) return null;
    
    const isCorrect = selectedAnswer === question.correctAnswer;
    const actualProgress = ((Object.keys(answeredQuestions).length) / quizQuestions.length) * 100;

    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-sm font-medium">
            Pergunta {currentQuestion + 1} de {quizQuestions.length}
          </span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeSpent)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso</span>
            <span>{Math.round(actualProgress)}%</span>
          </div>
          <Progress value={actualProgress} className="h-2" />
        </div>

        <Card className="animate-fade-in">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-3">
              {question.options.map((option, index) => {
                let optionClass = "w-full text-left py-3 px-4 rounded-md border border-border transition-all duration-200 hover:border-primary/50 hover:bg-primary/5";
                
                if (selectedAnswer) {
                  if (option === question.correctAnswer) {
                    optionClass = "w-full text-left py-3 px-4 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20";
                  } else if (option === selectedAnswer) {
                    optionClass = "w-full text-left py-3 px-4 rounded-md border border-red-500 bg-red-50 dark:bg-red-900/20";
                  }
                }
                
                return (
                  <Button 
                    key={index} 
                    variant="ghost" 
                    className={optionClass}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-6 w-6 shrink-0 rounded-full border border-muted-foreground/30 flex items-center justify-center text-sm">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-left">{option}</span>
                    </div>
                  </Button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-muted rounded-md animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === question.correctAnswer ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-500">Correto!</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <span className="font-medium">Explicação:</span>
                    </>
                  )}
                </div>
                <p className="text-sm">{question.explanation}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6">
            <Button 
              variant="outline" 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="micro-bounce w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="micro-bounce w-full sm:w-auto"
            >
              {currentQuestion < quizQuestions.length - 1 ? (
                <>
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                "Finalizar Quiz"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  const renderQuizResults = () => {
    const score = calculateScore();
    const formattedTime = quizStartTime && quizEndTime 
      ? formatTime(Math.floor((quizEndTime.getTime() - quizStartTime.getTime()) / 1000))
      : formatTime(timeSpent);
    
    return (
      <Card className="w-full max-w-2xl mx-auto animate-scale-in">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Quiz Concluído!</CardTitle>
          <CardDescription>Confira seu desempenho neste quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{score.correct}/{score.total}</p>
            <p className="text-muted-foreground">Respostas corretas</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Seu desempenho</span>
              <span className="font-medium">{score.percentage}%</span>
            </div>
            <Progress value={score.percentage} className="h-2" />
          </div>

          <div className="flex justify-between items-center p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>Tempo total</span>
            </div>
            <span className="font-medium">{formattedTime}</span>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="font-medium mb-2">Resumo das Respostas</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {quizQuestions.map((question, index) => {
                const userAnswer = answeredQuestions[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span>✕</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{question.question}</p>
                      <p className="text-xs text-muted-foreground">
                        Sua resposta: <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>{userAnswer}</span>
                        {!isCorrect && (
                          <span className="text-green-500 ml-2">
                            | Resposta correta: {question.correctAnswer}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6">
          <Button 
            variant="outline" 
            onClick={handleBackToHome} 
            className="micro-bounce w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
          <Button 
            onClick={() => {
              setQuizStarted(false);
              setSelectedAnswer(null);
              setAnsweredQuestions({});
              setShowExplanation(false);
              setQuizCompleted(false);
              setQuizQuestions([]);
            }} 
            className="micro-bounce w-full sm:w-auto"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Novo Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto min-h-screen overflow-y-auto pb-16">
      <section className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Quiz</h1>
        <p className="text-sm md:text-base text-muted-foreground">Teste seus conhecimentos e aprenda com exercícios interativos</p>
      </section>

      {isGenerating && renderGeneratingQuiz()}
      {!isGenerating && !quizStarted && renderQuizStart()}
      {!isGenerating && quizStarted && !quizCompleted && quizQuestions.length > 0 && renderQuizQuestion()}
      {!isGenerating && quizCompleted && renderQuizResults()}
    </div>
  );
};

export default Quiz;
