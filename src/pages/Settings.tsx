import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { PushNotificationSettings } from '@/components/PushNotificationSettings';
import { Settings as SettingsIcon, Bell, Palette, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/hooks/useSettings';
export default function Settings() {
  const { 
    darkMode, 
    setDarkMode, 
    notifyNewMsp, 
    setNotifyNewMsp, 
    notifyUpdates, 
    setNotifyUpdates 
  } = useSettings();

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      
      <div className="lg:ml-64">
        <Header title="Paramètres" showBack backTo="/" />
        
        <main className="container px-4 py-6 pb-20 lg:pb-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Paramètres</h1>
              <p className="text-muted-foreground">Configurez votre application</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Gérez vos préférences de notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-new">Nouvelles fiches MSP (in-app)</Label>
                  <Switch 
                    id="notif-new" 
                    checked={notifyNewMsp}
                    onCheckedChange={setNotifyNewMsp}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-update">Mises à jour (in-app)</Label>
                  <Switch 
                    id="notif-update" 
                    checked={notifyUpdates}
                    onCheckedChange={setNotifyUpdates}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <PushNotificationSettings />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Apparence
                </CardTitle>
                <CardDescription>Personnalisez l'interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Mode sombre</Label>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Link to="/confidentialite">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Confidentialité
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>Politique de confidentialité et vos droits</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  À propos
                </CardTitle>
                <CardDescription>Informations sur l'application</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  CatalMSP v1.0.0 - Catalogue des fiches MSP
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
