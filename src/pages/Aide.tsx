import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { HelpCircle, Mail, MessageCircle, Book } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Aide() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      
      <div className="lg:ml-64">
        <Header title="Aide" showBack backTo="/" />
        
        <main className="container px-4 py-6 pb-20 lg:pb-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Centre d'aide</h1>
              <p className="text-muted-foreground">Trouvez des réponses à vos questions</p>
            </div>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Questions fréquentes
                </CardTitle>
                <CardDescription>Les réponses aux questions les plus courantes</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Comment créer une fiche MSP ?</AccordionTrigger>
                    <AccordionContent>
                      Cliquez sur le bouton "Nouvelle fiche MSP" dans le menu principal ou sur la page d'accueil. 
                      Remplissez ensuite les informations demandées et validez.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Comment scanner un QR code ?</AccordionTrigger>
                    <AccordionContent>
                      Accédez à la page Scanner depuis le menu. Autorisez l'accès à la caméra et pointez 
                      vers le QR code à scanner.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Comment ajouter un site conventionné ?</AccordionTrigger>
                    <AccordionContent>
                      Rendez-vous dans la section "Sites conventionnés" et cliquez sur "Nouveau site". 
                      Renseignez les informations du site et les coordonnées du contact.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Puis-je utiliser l'application hors ligne ?</AccordionTrigger>
                    <AccordionContent>
                      Oui, l'application est une PWA et peut être installée sur votre appareil pour 
                      une utilisation partielle hors ligne.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Nous contacter
                </CardTitle>
                <CardDescription>Besoin d'aide supplémentaire ?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">support@catalmsp.fr</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
