import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import { useProgress } from '@/hooks/useProgress';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FileCheck, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  Send, 
  RotateCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Book,
  PenTool,
  Save,
  ArrowLeft,
  ListChecks
} from 'lucide-react';

const essayTopics = [
  {
    id: 1,
    title: 'Impactos da Tecnologia na Educação',
    description: 'Discuta como as novas tecnologias estão transformando os métodos de ensino e aprendizagem',
    deadline: '5 dias',
    materials: [
      { title: 'Artigo: Tecnologia e Educação no Século XXI', url: '#' },
      { title: 'Vídeo: O Futuro da Sala de Aula', url: '#' },
      { title: 'Infográfico: Estatísticas de Aprendizagem Digital', url: '#' },
    ]
  },
  {
    id: 2,
    title: 'Desafios da Sustentabilidade no Brasil',
    description: 'Analise os principais desafios ambientais enfrentados pelo Brasil e possíveis soluções',
    deadline: '7 dias',
    materials: [
      { title: 'Relatório: Situação Ambiental Brasileira 2023', url: '#' },
      { title: 'Artigo: Políticas Públicas para Sustentabilidade', url: '#' },
      { title: 'Documentário: Amazônia em Risco', url: '#' },
    ]
  },
];

const mockFeedback = {
  score: 850,
  maxScore: 1000,
  competencies: [
    { 
      name: 'Domínio da norma culta', 
      score: 180, 
      maxScore: 200,
      feedback: 'Bom domínio da modalidade escrita formal, com poucos desvios gramaticais e de convenções da escrita.',
      status: 'good'
    },
    { 
      name: 'Compreensão da proposta', 
      score: 160, 
      maxScore: 200,
      feedback: 'Compreende bem a proposta e desenvolve o tema, mas com algumas limitações na articulação das ideias.',
      status: 'medium'
    },
    { 
      name: 'Capacidade de argumentação', 
      score: 170, 
      maxScore: 200,
      feedback: 'Seleciona e relaciona argumentos de forma consistente em defesa de seu ponto de vista.',
      status: 'good'
    },
    { 
      name: 'Construção lógica', 
      score: 170, 
      maxScore: 200,
      feedback: 'Articula as partes do texto de maneira coerente, mas com algumas falhas na progressão textual.',
      status: 'medium'
    },
    { 
      name: 'Proposta de intervenção', 
      score: 170, 
      maxScore: 200,
      feedback: 'Elabora proposta de intervenção clara e relacionada ao tema, respeitando os direitos humanos.',
      status: 'good'
    },
  ],
  generalFeedback: 'Sua redação apresenta uma boa compreensão do tema e argumentação consistente. Para melhorar, procure aprofundar mais alguns pontos e trabalhar na construção lógica do texto. A proposta de intervenção é adequada, mas poderia ser mais detalhada.'
};

const Essay = () => {
  const navigate = useNavigate();
  const { essays, addEssay, updateEssayScore, loading } = useProgress();
  const [selectedTopic, setSelectedTopic] = useState<typeof essayTopics[0] | null>(null);
  const [essayText, setEssayText] = useState('');
  const [submittedEssay, setSubmittedEssay] = useState(false);
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<typeof mockFeedback | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [aiGeneratedTopic, setAiGeneratedTopic] = useState<any | null>(null);
  const [essayStartTime, setEssayStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [autosaveInterval, setAutosaveInterval] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [minWordCount] = useState(300);
  const [idealWordCount] = useState(500);
  const [writingProgress, setWritingProgress] = useState(0);
  const [workingOnEssay, setWorkingOnEssay] = useState(false);
  const [viewingPastEssay, setViewingPastEssay] = useState(false);

  const resetViewStates = () => {
    setViewingPastEssay(false);
    setFeedback(null);
    setSubmittedEssay(false);
    setCurrentEssayId(null);
    setSelectedTopic(null);
    setEssayText('');
    setWorkingOnEssay(false);
  };

  useEffect(() => {
    let timer: number;
    
    if (selectedTopic && !submittedEssay && workingOnEssay) {
      if (!essayStartTime) {
        setEssayStartTime(new Date());
      }
      
      timer = window.setInterval(() => {
        if (essayStartTime) {
          const now = new Date();
          const diff = now.getTime() - essayStartTime.getTime();
          setTimeSpent(Math.floor(diff / 1000)); // in seconds
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedTopic, submittedEssay, essayStartTime, workingOnEssay]);
  
  useEffect(() => {
    let interval: number;
    
    if (selectedTopic && essayText && !submittedEssay && workingOnEssay) {
      interval = window.setInterval(() => {
        console.log('Auto-saving essay...', new Date());
        saveEssay(true);
      }, 30000);
      
      setAutosaveInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTopic, essayText, submittedEssay, workingOnEssay]);
  
  useEffect(() => {
    if (wordCount >= idealWordCount) {
      setWritingProgress(100);
    } else if (wordCount >= minWordCount) {
      const scaledProgress = 66 + (wordCount - minWordCount) / (idealWordCount - minWordCount) * 34;
      setWritingProgress(Math.round(scaledProgress));
    } else if (wordCount > 0) {
      const scaledProgress = (wordCount / minWordCount) * 66;
      setWritingProgress(Math.round(scaledProgress));
    } else {
      setWritingProgress(0);
    }
  }, [wordCount, minWordCount, idealWordCount]);

  const selectTopic = (topic: typeof essayTopics[0]) => {
    setSelectedTopic(topic);
    setSubmittedEssay(false);
    setFeedback(null);
    setEssayText('');
    setEssayStartTime(new Date());
    setTimeSpent(0);
    setLastSaved(null);
    setWorkingOnEssay(true);
    setViewingPastEssay(false);
    setCurrentEssayId(null);
  };

  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayText(e.target.value);
    setWordCount(e.target.value.split(/\s+/).filter(Boolean).length);
  };

  const saveEssay = async (isAutosave = false) => {
    if (!essayText.trim() || !selectedTopic) return;
    
    try {
      if (currentEssayId) {
        setLastSaved(new Date());
        if (!isAutosave) {
          toast.success("Rascunho atualizado com sucesso!");
        }
        return;
      }
      
      const savedEssay = await addEssay(
        selectedTopic.title,
        essayText,
        wordCount,
        timeSpent
      );
      
      if (savedEssay) {
        setCurrentEssayId(savedEssay.id);
        setLastSaved(new Date());
        if (!isAutosave) {
          toast.success("Rascunho salvo com sucesso!");
        }
      }
    } catch (error) {
      console.error("Error saving essay:", error);
      if (!isAutosave) {
        toast.error("Erro ao salvar o rascunho.");
      }
    }
  };

  const submitEssay = async () => {
    if (!essayText.trim() || wordCount < 50 || !selectedTopic) return;
    
    if (!currentEssayId) {
      try {
        const savedEssay = await addEssay(
          selectedTopic.title,
          essayText,
          wordCount,
          timeSpent
        );
        
        if (savedEssay) {
          setCurrentEssayId(savedEssay.id);
        } else {
          toast.error("Erro ao salvar a redação antes de analisar.");
          return;
        }
      } catch (error) {
        console.error("Error saving essay:", error);
        toast.error("Erro ao salvar a redação.");
        return;
      }
    }
    
    setSubmittedEssay(true);
    setAnalyzing(true);
    
    setTimeout(async () => {
      setAnalyzing(false);
      setFeedback(mockFeedback);
      
      if (currentEssayId) {
        try {
          await updateEssayScore(currentEssayId, mockFeedback.score);
        } catch (error) {
          console.error("Error updating essay score:", error);
        }
      }
    }, 3000);
  };

  const resetEssay = () => {
    setSelectedTopic(null);
    setSubmittedEssay(false);
    setFeedback(null);
    setEssayText('');
    setAiGeneratedTopic(null);
    setEssayStartTime(null);
    setTimeSpent(0);
    setLastSaved(null);
    setWritingProgress(0);
    setCurrentEssayId(null);
    setWorkingOnEssay(false);
    setViewingPastEssay(false);
    
    if (autosaveInterval) {
      clearInterval(autosaveInterval);
    }
  };

  const viewPastEssay = (essay: any) => {
    setViewingPastEssay(true);
    setWorkingOnEssay(false);
    setCurrentEssayId(essay.id);
    setEssayText(essay.content);
    setWordCount(essay.word_count);
    setTimeSpent(essay.time_spent);
    
    const matchingTopic = essayTopics.find(topic => topic.title === essay.title);
    if (matchingTopic) {
      setSelectedTopic(matchingTopic);
    } else {
      setSelectedTopic({
        id: 999,
        title: essay.title,
        description: "Redação salva anteriormente",
        deadline: "Concluída",
        materials: []
      });
    }
    
    if (essay.status === "evaluated" && essay.score) {
      setSubmittedEssay(true);
      const essayFeedback = {
        ...mockFeedback,
        score: essay.score,
      };
      setFeedback(essayFeedback);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const generateTheme = async () => {
    setIsGeneratingTheme(true);
    
    try {
      toast.info("Esta é uma simulação. A integração real será implementada quando a chave API for fornecida.");
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setAiGeneratedTopic(essayTopics[0]);
      setSelectedTopic(essayTopics[0]);
      setIsGeneratingTheme(false);
      setWorkingOnEssay(true);
    } catch (error) {
      setIsGeneratingTheme(false);
      toast.error("Erro ao gerar o tema. Tente novamente mais tarde.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'bad':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    if (writingProgress >= 100) return "bg-green-500";
    if (writingProgress >= 66) return "bg-blue-500";
    if (writingProgress >= 33) return "bg-yellow-500";
    return "bg-red-500";
  };

  const navigateToProgress = () => {
    navigate('/progress');
  };

  const navigateToQuiz = () => {
    navigate('/quiz');
  };

  const renderTopActionsBar = () => (
    <div className="flex justify-between items-center mb-6 gap-4">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={resetEssay}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        
        <Button 
          onClick={() => resetViewStates()}
          variant="default"
          className="flex items-center gap-2"
        >
          <PenTool className="h-4 w-4" />
          <span>Nova Redação</span>
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={navigateToProgress}
          className="flex items-center gap-2"
        >
          <ListChecks className="h-4 w-4" />
          <span className="hidden sm:inline">Meu Progresso</span>
        </Button>
        
        <Button
          variant="outline" 
          onClick={navigateToQuiz}
          className="flex items-center gap-2"
        >
          <FileCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Quizzes</span>
        </Button>
      </div>
    </div>
  );

  const renderEssayList = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Suas Redações</CardTitle>
        <CardDescription>
          Veja o histórico das redações que você já escreveu
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 rounded-full border-t-2 border-primary animate-spin"></div>
          </div>
        ) : essays.length > 0 ? (
          <div className="space-y-4">
            {essays.map((essay) => (
              <div 
                key={essay.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => viewPastEssay(essay)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{essay.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(essay.created_at).toLocaleDateString()} • {essay.word_count} palavras
                    </p>
                  </div>
                  <div className="flex items-center">
                    {essay.status === "evaluated" ? (
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>Avaliada: {essay.score}/1000</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Enviada</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm line-clamp-2">
                  {essay.content.substring(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma redação encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não escreveu nenhuma redação. Comece agora!
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => setSelectedTopic(null)} 
          className="w-full"
        >
          <PenTool className="h-4 w-4 mr-2" />
          Escrever Nova Redação
        </Button>
      </CardFooter>
    </Card>
  );

  const renderTopicSelection = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PenTool className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Geração de Tema de Redação</CardTitle>
        <CardDescription>Nossa IA irá gerar um tema para você praticar sua redação</CardDescription>
      </CardHeader>
      <CardContent className="py-6 text-center">
        <p className="mb-6">
          Clique no botão abaixo para que nossa inteligência artificial gere um tema de redação
          original para você praticar. Você receberá o tema e materiais de apoio para ajudar
          na sua escrita.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={generateTheme} 
          className="micro-bounce"
          size="lg"
          disabled={isGeneratingTheme}
        >
          {isGeneratingTheme ? (
            <span className="animate-pulse">Gerando Tema...</span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Tema com IA
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderGeneratingTheme = () => (
    <Card className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader className="text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <CardTitle className="text-2xl">Gerando Tema de Redação</CardTitle>
        <CardDescription>Nossa IA está criando um tema original e materiais de apoio</CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="h-2 w-full max-w-md bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse-slow rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p>Analisando temas relevantes e preparando materiais</p>
            <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEssayEditor = () => (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{selectedTopic?.title}</CardTitle>
            <CardDescription>{selectedTopic?.description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetEssay}>
            Voltar aos Temas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Tempo: {formatTime(timeSpent)}</span>
          </div>
          {lastSaved && (
            <div className="text-xs text-muted-foreground">
              Último salvamento: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Progresso da escrita</span>
            <span>
              {wordCount < minWordCount ? 
                `${wordCount}/${minWordCount} palavras (mínimo)` : 
                `${wordCount} palavras ${wordCount >= idealWordCount ? '(excelente!)' : ''}`
              }
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`} 
              style={{ width: `${writingProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Materiais de Apoio</span>
          </h3>
          <ul className="space-y-2">
            {selectedTopic?.materials.map((material, idx) => (
              <li key={idx} className="text-sm flex items-center gap-2">
                <a 
                  href={material.url} 
                  className="text-primary hover:underline flex items-center gap-1"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {material.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="essay" className="text-sm font-medium">
              Sua Redação
            </label>
            <span className={`text-sm ${wordCount < minWordCount ? 'text-red-500' : wordCount >= idealWordCount ? 'text-green-500' : 'text-muted-foreground'}`}>
              {wordCount} palavras {wordCount < minWordCount && `(mínimo: ${minWordCount})`}
            </span>
          </div>
          <Textarea
            id="essay"
            placeholder="Comece a escrever sua redação aqui..."
            className="min-h-[300px] font-mono text-sm resize-y"
            value={essayText}
            onChange={handleEssayChange}
            disabled={submittedEssay || viewingPastEssay}
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-between">
        {!viewingPastEssay && (
          <>
            <Button 
              variant="outline" 
              onClick={() => saveEssay()} 
              className="micro-bounce" 
              disabled={!essayText.trim() || submittedEssay}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button 
              onClick={submitEssay} 
              className="micro-bounce" 
              disabled={submittedEssay || wordCount < 50}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar para Análise
            </Button>
          </>
        )}
        {viewingPastEssay && (
          <Button 
            onClick={resetEssay} 
            className="w-full"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Voltar para Redações
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderAnalysis = () => (
    <div className="animate-fade-in">
      {analyzing ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span>Analisando sua Redação</span>
            </CardTitle>
            <CardDescription>
              Nosso sistema está avaliando seu texto com base nas cinco competências
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-t-primary border-muted animate-spin"></div>
            </div>
            <div className="space-y-2 text-center">
              <p>Por favor, aguarde enquanto processamos sua redação</p>
              <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="feedback">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> Análise
            </TabsTrigger>
            <TabsTrigger value="essay" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Sua Redação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="animate-fade-in mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Análise da Redação</CardTitle>
                    <CardDescription>
                      Avaliação baseada nas cinco competências
                    </CardDescription>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{feedback?.score}</p>
                    <p className="text-sm text-muted-foreground">de {feedback?.maxScore}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>Tempo total de escrita</span>
                  </div>
                  <span className="font-medium">{formatTime(timeSpent)}</span>
                </div>
                
                <div className="space-y-4">
                  {feedback?.competencies.map((comp, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(comp.status)}
                          <span className="font-medium">{comp.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {comp.score}/{comp.maxScore}
                        </span>
                      </div>
                      <Progress 
                        value={(comp.score / comp.maxScore) * 100} 
                        className="h-2" 
                      />
                      <p className="text-sm text-muted-foreground">{comp.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Comentário Geral</h3>
                  <p className="text-sm">{feedback?.generalFeedback}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetEssay}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Novo Tema
                </Button>
                {!viewingPastEssay && (
                  <Button onClick={() => {
                    setSubmittedEssay(false);
                    setFeedback(null);
                  }}>
                    Revisar e Reenviar
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="essay" className="animate-fade-in mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sua Redação</CardTitle>
                <CardDescription>
                  Texto enviado para análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap font-mono text-sm">
                  {essayText || "Nenhum texto enviado."}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-200px)] overflow-y-auto">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Redação</h1>
        <p className="text-muted-foreground">Escreva redações e receba feedback automático para melhorar suas habilidades</p>
      </section>

      {renderTopActionsBar()}

      {!selectedTopic && !isGeneratingTheme && renderEssayList()}

      {isGeneratingTheme && renderGeneratingTheme()}
      {!isGeneratingTheme && !selectedTopic && !essays.length && renderTopicSelection()}
      {!isGeneratingTheme && selectedTopic && !submittedEssay && renderEssayEditor()}
      {!isGeneratingTheme && submittedEssay && renderAnalysis()}
    </div>
  );
};

export default Essay;
