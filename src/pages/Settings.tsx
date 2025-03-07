
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, UserCircle, Bell, Shield, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 px-2 sm:px-0 max-w-5xl mx-auto">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="hover-lift transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <UserCircle className="h-5 w-5 text-primary" />
              <span>Perfil</span>
            </CardTitle>
            <CardDescription>Gerencie suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base">Atualize seu nome, email e outras informações de perfil.</p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Bell className="h-5 w-5 text-primary" />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>Configure suas preferências de notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base">Escolha como e quando deseja receber notificações sobre atividades.</p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Shield className="h-5 w-5 text-primary" />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>Gerencie as configurações de segurança</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base">Atualize sua senha e configure métodos de autenticação de dois fatores.</p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Palette className="h-5 w-5 text-primary" />
              <span>Aparência</span>
            </CardTitle>
            <CardDescription>Personalize a interface da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base">Ajuste o tema, cores e outras preferências visuais.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
