
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  FileQuestion, 
  BookOpen, 
  Lightbulb,
  Loader2,
  Home
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProgress } from '@/hooks/useProgress';
import { useNavigate } from 'react-router-dom';

const ChatAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { essays, quizResults } = useProgress();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Olá! Sou seu assistente de estudos. Como posso ajudar você hoje?',
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  }, [messages.length]);

  // Fetch user info on component mount
  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Prepare user data to provide context to the AI
      const userData = {
        essays: essays.map(essay => ({
          title: essay.title,
          score: essay.score,
          date: essay.created_at,
          status: essay.status
        })),
        quizResults: quizResults.map(quiz => ({
          quiz_name: quiz.quiz_name,
          score: quiz.score,
          total_questions: quiz.total_questions,
          date: quiz.created_at
        })),
        user: userInfo
      };

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          prompt: inputMessage,
          type: 'chat',
          userData
        }
      });

      if (error) {
        throw error;
      }

      // Add AI response
      const aiResponse = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      toast.error('Erro ao conectar com o assistente IA. Tente novamente.');
      
      // Add error message
      const errorResponse = {
        role: 'assistant',
        content: 'Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente mais tarde.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 h-full px-4 sm:px-6 md:px-8 pb-4">
      <section className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assistente IA</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="md:hidden"
          >
            <Home className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </div>
        <p className="text-muted-foreground">Converse com nosso assistente inteligente para esclarecer dúvidas</p>
      </section>

      <Tabs defaultValue="chat" className="w-full h-[calc(100%-100px)]">
        <TabsList className="grid w-full md:w-auto grid-cols-2 gap-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" /> Ajuda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="animate-fade-in h-full">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>Chat com Assistente IA</span>
              </CardTitle>
              <CardDescription>
                Tire suas dúvidas sobre a plataforma e recursos de estudo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full rounded-md border p-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.role === 'user'
                            ? 'flex-row-reverse'
                            : 'flex-row'
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Bot className="h-5 w-5" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent'
                          }`}
                        >
                          <div className="space-y-2">
                            <p>{message.content}</p>
                            <p className={`text-xs ${
                              message.role === 'user'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="rounded-lg px-4 py-2 text-sm bg-accent">
                          <div className="flex gap-1">
                            <span className="animate-pulse">.</span>
                            <span className="animate-pulse delay-75">.</span>
                            <span className="animate-pulse delay-150">.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="micro-bounce" 
                  disabled={!inputMessage.trim() || isTyping}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Quizzes',
                description: 'Como funcionam os quizzes interativos',
                icon: FileQuestion,
                content: 'Os quizzes são exercícios de múltipla escolha que testam seu conhecimento em diversas áreas. Após responder cada questão, você receberá feedback imediato e explicações detalhadas para ajudar no seu aprendizado.'
              },
              {
                title: 'Redações',
                description: 'Sistema de redação e feedback automático',
                icon: BookOpen,
                content: 'Temas de redação são disponibilizados semanalmente junto com materiais de apoio. Após enviar sua redação, nosso sistema de IA analisará o texto com base nas cinco competências exigidas pelo ENEM e fornecerá feedback detalhado.'
              },
              {
                title: 'Progresso',
                description: 'Como acompanhar seu desenvolvimento',
                icon: Lightbulb,
                content: 'A aba de Progresso oferece uma visão detalhada do seu desempenho. Você poderá acompanhar seus resultados em quizzes, suas redações, pontuação acumulada e estatísticas de atividade na plataforma.'
              },
            ].map((item, index) => (
              <Card key={index} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatAI;
