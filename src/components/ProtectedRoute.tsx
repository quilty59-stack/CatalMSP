import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireApproval?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requireApproval = true }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isApproved, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (requireApproval && !isApproved && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <img src={logo} alt="CatalMSP" className="w-16 h-16" />
            </div>
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <CardTitle className="font-display text-xl">Compte en attente</CardTitle>
            <CardDescription>
              Votre compte est en attente d'approbation par un administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous serez notifié une fois votre compte validé. Merci de votre patience.
            </p>
            <Button variant="outline" onClick={signOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
