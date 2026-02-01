import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield, Users, CheckCircle, XCircle, Clock, UserCheck, UserX } from 'lucide-react';

type AppRole = 'admin' | 'formateur' | 'pending';

interface UserWithRole {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_approved: boolean;
  created_at: string;
  role: AppRole;
}

export default function Admin() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      return;
    }
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, authLoading, navigate]);

  const loadUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
        return;
      }

      // Combine data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile: any) => {
        const userRole = roles?.find((r: any) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role as AppRole) || 'pending',
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApproval = async (userId: string, isApproved: boolean) => {
    setUpdatingUser(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: isApproved })
        .eq('user_id', userId);

      if (error) throw error;

      // If approving, also change role from pending to formateur
      if (isApproved) {
        await supabase
          .from('user_roles')
          .update({ role: 'formateur' })
          .eq('user_id', userId);
      }

      toast({
        title: isApproved ? 'Utilisateur approuvé' : 'Utilisateur refusé',
        description: isApproved 
          ? "L'utilisateur peut maintenant accéder à l'application"
          : "L'accès a été retiré à l'utilisateur",
      });

      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const updateRole = async (userId: string, newRole: AppRole) => {
    setUpdatingUser(userId);
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Rôle mis à jour',
        description: `Le rôle a été changé en "${newRole}"`,
      });

      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'formateur':
        return <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />Formateur</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-success"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>
    ) : (
      <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Non approuvé</Badge>
    );
  };

  const pendingCount = users.filter(u => !u.is_approved).length;
  const approvedCount = users.filter(u => u.is_approved).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ResponsiveLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs et les accès
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>En attente</CardDescription>
              <CardTitle className="text-3xl text-warning">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approuvés</CardDescription>
              <CardTitle className="text-3xl text-success">{approvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Administrateurs</CardDescription>
              <CardTitle className="text-3xl text-primary">{adminCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs inscrits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun utilisateur inscrit
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: AppRole) => updateRole(user.user_id, value)}
                            disabled={updatingUser === user.user_id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="formateur">Formateur</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{getApprovalBadge(user.is_approved)}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          {updatingUser === user.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin ml-auto" />
                          ) : user.is_approved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApproval(user.user_id, false)}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Retirer
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => updateApproval(user.user_id, true)}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}
