import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut, Shield, Settings } from 'lucide-react';

export function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/connexion">Connexion</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/inscription">S'inscrire</Link>
        </Button>
      </div>
    );
  }

  const initials = profile
    ? `${profile.first_name[0] || ''}${profile.last_name[0] || ''}`
    : user.email?.[0]?.toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/connexion');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Utilisateur'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Administration
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
