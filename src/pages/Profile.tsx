
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, BookOpen, GraduationCap, User, Mail, Phone, Calendar, MapPin, Edit, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    city: '',
    state: '',
    education_level: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      
      // First, try to get existing user info
      const { data, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // User info exists, set it
        setUserInfo({
          id: data.id,
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          birth_date: data.birth_date || '',
          city: data.city || '',
          state: data.state || '',
          education_level: data.education_level || ''
        });
      } else {
        // User info doesn't exist, set defaults from auth
        setUserInfo({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: '',
          birth_date: '',
          city: '',
          state: '',
          education_level: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      toast.error('Erro ao carregar informações do usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if the user info already exists
      const { data, error: checkError } = await supabase
        .from('user_info')
        .select('id')
        .eq('id', user.id)
        .single();
      
      let saveError;
      
      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('user_info')
          .update({
            full_name: userInfo.full_name,
            email: userInfo.email,
            phone: userInfo.phone,
            birth_date: userInfo.birth_date,
            city: userInfo.city,
            state: userInfo.state,
            education_level: userInfo.education_level,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        saveError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_info')
          .insert({
            id: user.id,
            full_name: userInfo.full_name,
            email: userInfo.email,
            phone: userInfo.phone,
            birth_date: userInfo.birth_date,
            city: userInfo.city,
            state: userInfo.state,
            education_level: userInfo.education_level
          });
        
        saveError = error;
      }
      
      if (saveError) {
        throw saveError;
      }
      
      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (error) {
      console.error('Error saving user info:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const toggleEditing = () => {
    setEditing(!editing);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Carregando informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">Visualize e edite suas informações pessoais</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>{userInfo.full_name || 'Usuário'}</CardTitle>
            <CardDescription>{userInfo.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{userInfo.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{userInfo.phone || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{userInfo.birth_date || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>
                {userInfo.city && userInfo.state 
                  ? `${userInfo.city}, ${userInfo.state}` 
                  : 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <span>{userInfo.education_level || 'Não informado'}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full micro-bounce" 
              variant="outline"
              onClick={toggleEditing}
            >
              <Edit className="h-4 w-4 mr-2" />
              {editing ? 'Cancelar Edição' : 'Editar Perfil'}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="achievements">Conquistas</TabsTrigger>
              <TabsTrigger value="settings">Preferências</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    {editing 
                      ? 'Atualize suas informações pessoais' 
                      : 'Suas informações pessoais'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input 
                        id="full_name" 
                        name="full_name"
                        value={userInfo.full_name} 
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        value={userInfo.email} 
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        value={userInfo.phone} 
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento</Label>
                      <Input 
                        id="birth_date" 
                        name="birth_date"
                        value={userInfo.birth_date} 
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="DD/MM/AAAA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        name="city"
                        value={userInfo.city} 
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input 
                        id="state" 
                        name="state"
                        value={userInfo.state} 
                        onChange={handleChange}
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="education_level">Nível de Escolaridade</Label>
                      {editing ? (
                        <Select
                          value={userInfo.education_level}
                          onValueChange={(value) => handleSelectChange('education_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu nível de escolaridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ensino Fundamental - Em andamento">Ensino Fundamental - Em andamento</SelectItem>
                            <SelectItem value="Ensino Fundamental - Completo">Ensino Fundamental - Completo</SelectItem>
                            <SelectItem value="Ensino Médio - 1º Ano">Ensino Médio - 1º Ano</SelectItem>
                            <SelectItem value="Ensino Médio - 2º Ano">Ensino Médio - 2º Ano</SelectItem>
                            <SelectItem value="Ensino Médio - 3º Ano">Ensino Médio - 3º Ano</SelectItem>
                            <SelectItem value="Ensino Médio - Completo">Ensino Médio - Completo</SelectItem>
                            <SelectItem value="Ensino Superior - Em andamento">Ensino Superior - Em andamento</SelectItem>
                            <SelectItem value="Ensino Superior - Completo">Ensino Superior - Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          id="education_level" 
                          value={userInfo.education_level || 'Não informado'} 
                          disabled
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
                {editing && (
                  <CardFooter>
                    <Button 
                      className="micro-bounce"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Conquistas</CardTitle>
                  <CardDescription>Badges e conquistas desbloqueadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Primeira Redação', description: 'Completou sua primeira redação', icon: BookOpen },
                      { name: 'Quiz Master', description: '10 quizzes com nota máxima', icon: Award },
                      { name: 'Estudante Dedicado', description: '7 dias consecutivos de estudo', icon: GraduationCap },
                    ].map((achievement, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg hover-lift">
                        <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <achievement.icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="font-medium">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>Personalize sua experiência na plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Notificações por email', description: 'Receba atualizações sobre sua atividade' },
                    { label: 'Lembretes diários', description: 'Lembretes para manter sua rotina de estudos' },
                    { label: 'Sugestões personalizadas', description: 'Atividades baseadas no seu desempenho' },
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <h3 className="font-medium">{setting.label}</h3>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="flex items-center h-5 w-10 bg-primary/30 rounded-full p-1 cursor-pointer">
                        <div className="h-4 w-4 rounded-full bg-primary transform translate-x-5 transition-transform"></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
