import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Info } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le mot de passe doit contenir au moins 6 caractères',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Prepare email data before signup
    const emailData = { email, firstName, lastName };
    const adminData = { userEmail: email, firstName, lastName };
    
    const { error } = await signUp(email, password, firstName, lastName);

    if (error) {
      setIsLoading(false);
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    // Send welcome email, admin notification, and in-app notification
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
    };

    // Use Promise.allSettled to send all notifications
    try {
      const [welcomeResult, adminResult, notificationResult] = await Promise.allSettled([
        // Welcome email
        fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
          method: 'POST',
          headers,
          body: JSON.stringify(emailData),
        }),
        // Admin email notification (existing)
        fetch(`${supabaseUrl}/functions/v1/send-admin-notification`, {
          method: 'POST',
          headers,
          body: JSON.stringify(adminData),
        }),
        // Admin in-app + push notification (new)
        fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'user_signup',
            title: 'Nouvelle inscription',
            message: `Nouvelle inscription : ${firstName} ${lastName} (${email})`,
            link: '/admin',
            metadata: {
              userEmail: email,
              firstName,
              lastName,
            },
          }),
        }),
      ]);

      // Log results for debugging
      if (welcomeResult.status === 'fulfilled') {
        console.log('Welcome email status:', welcomeResult.value.status);
      } else {
        console.error('Welcome email failed:', welcomeResult.reason);
      }

      if (adminResult.status === 'fulfilled') {
        console.log('Admin notification status:', adminResult.value.status);
      } else {
        console.error('Admin notification failed:', adminResult.reason);
      }

      if (notificationResult.status === 'fulfilled') {
        console.log('In-app notification status:', notificationResult.value.status);
      } else {
        console.error('In-app notification failed:', notificationResult.reason);
      }
    } catch (emailError) {
      console.error('Failed to send notifications:', emailError);
    }

    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="CatalMSP" className="w-16 h-16" />
            </div>
            <CardTitle className="font-display text-2xl text-success">Inscription réussie !</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Votre inscription a bien été enregistrée. Un administrateur doit maintenant valider votre compte avant que vous puissiez vous connecter.
              </AlertDescription>
            </Alert>
            <p className="text-center text-muted-foreground text-sm">
              Vous recevrez un email dès que votre compte sera validé.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/connexion')}>
              Retour à la connexion
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="CatalMSP" className="w-16 h-16" />
          </div>
          <CardTitle className="font-display text-2xl">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte formateur CatalMSP
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Après inscription, un administrateur devra valider votre compte.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              S'inscrire
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
