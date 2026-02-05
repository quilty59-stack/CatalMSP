import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { Shield, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
  const emailContact = "quilty59@gmail.com";
  const lastUpdate = "5 février 2026";

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      
      <div className="lg:ml-64">
        <Header title="Confidentialité" showBack backTo="/settings" />
        
        <main className="container px-4 py-6 pb-20 lg:pb-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Politique de confidentialité</h1>
              <p className="text-muted-foreground">Dernière mise à jour : {lastUpdate}</p>
            </div>
          </div>

          <Card>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6 space-y-6">
              <p className="text-muted-foreground">
                Votre confidentialité est importante pour nous. Cette politique de confidentialité explique quelles données nous collectons, comment nous les utilisons et quels sont vos droits concernant ces informations.
              </p>

              <section>
                <h2 className="text-lg font-semibold mb-3">1. Données collectées</h2>
                <p className="text-muted-foreground mb-3">
                  Notre application ne collecte aucune donnée personnelle sensible, sauf celles que vous fournissez volontairement via l'utilisation normale du service.
                </p>
                <p className="text-muted-foreground mb-3">Les données collectées peuvent être :</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Informations de navigation techniques (type d'appareil, navigateur, système d'exploitation)</li>
                  <li>Données liées à l'usage de l'application (interactions, pages consultées)</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Aucune donnée personnelle (nom, email, adresse) n'est collectée automatiquement.
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground">Notre application :</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>❌ ne collecte pas de données de localisation</li>
                    <li>❌ n'accède pas aux photos / fichiers de l'utilisateur</li>
                    <li>❌ n'accède pas à la caméra ou au microphone</li>
                    <li>❌ ne partage aucune donnée avec des tiers</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">2. Finalités du traitement</h2>
                <p className="text-muted-foreground mb-3">Les données éventuellement collectées servent uniquement à :</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>améliorer l'expérience utilisateur ;</li>
                  <li>garantir le bon fonctionnement de l'application ;</li>
                  <li>assurer la sécurité et la stabilité du service.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Nous ne revendons ni ne partageons vos données à des tiers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">3. Stockage et sécurité des données</h2>
                <p className="text-muted-foreground">
                  Les données sont stockées de manière sécurisée et protégées contre tout accès non autorisé.
                  Aucune donnée personnelle n'est exportée en dehors de l'UE.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">4. Cookies et technologies similaires</h2>
                <p className="text-muted-foreground mb-3">L'application peut utiliser des cookies techniques uniquement pour :</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>sauvegarder vos préférences,</li>
                  <li>garantir le fonctionnement de certaines fonctionnalités.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Aucun cookie publicitaire ou de suivi n'est utilisé.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">5. Vos droits</h2>
                <p className="text-muted-foreground mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>droit d'accès ;</li>
                  <li>droit de rectification ;</li>
                  <li>droit de suppression ;</li>
                  <li>droit d'opposition ;</li>
                  <li>droit de limitation du traitement.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Pour exercer ces droits, vous pouvez nous contacter à :
                </p>
                <a 
                  href={`mailto:${emailContact}`} 
                  className="inline-flex items-center gap-2 text-primary hover:underline mt-2"
                >
                  <Mail className="w-4 h-4" />
                  {emailContact}
                </a>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">6. Modifications</h2>
                <p className="text-muted-foreground">
                  Nous pouvons mettre à jour cette politique à tout moment. La version la plus récente sera toujours disponible dans l'application.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3">7. Contact</h2>
                <p className="text-muted-foreground mb-2">
                  Pour toute question concernant cette politique de confidentialité :
                </p>
                <a 
                  href={`mailto:${emailContact}`} 
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {emailContact}
                </a>
              </section>
            </CardContent>
          </Card>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
