import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Shield, Users, CheckCircle, XCircle, Clock, UserCheck, UserX, Plus, Trash2, KeyRound } from 'lucide-react';
import { MobileUserCard } from '@/components/admin/MobileUserCard';

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
  const { isAdmin, isLoading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  
  // New user form
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
        return;
      }

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

  const callAdminFunction = async (body: any) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(body),
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erreur serveur');
    }
    return data;
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserFirstName || !newUserLastName) {
      toast({
        title: 'Erreur',
        description: 'Tous les champs sont requis',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      await callAdminFunction({
        action: 'create',
        email: newUserEmail,
        password: newUserPassword,
        firstName: newUserFirstName,
        lastName: newUserLastName,
      });

      toast({
        title: 'Utilisateur créé',
        description: `${newUserFirstName} ${newUserLastName} a été créé avec succès`,
      });

      setIsCreateDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserFirstName('');
      setNewUserLastName('');
      
      await loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    setUpdatingUser(userId);
    try {
      await callAdminFunction({
        action: 'delete',
        userId,
      });

      toast({
        title: 'Utilisateur supprimé',
        description: `${userName} a été supprimé`,
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

  const resetPassword = async (email: string, userName: string) => {
    setUpdatingUser(email);
    try {
      await callAdminFunction({
        action: 'reset_password',
        email,
      });

      toast({
        title: 'Email envoyé',
        description: `Un email de réinitialisation a été envoyé à ${userName}`,
      });
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

  const updateApproval = async (userId: string, isApproved: boolean) => {
    setUpdatingUser(userId);
    try {
      // Get user info first for the email
      const user = users.find(u => u.user_id === userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: isApproved })
        .eq('user_id', userId);

      if (error) throw error;

      if (isApproved) {
        await supabase
          .from('user_roles')
          .update({ role: 'formateur' })
          .eq('user_id', userId);
      }

      // Send approval/rejection email
      if (user) {
        try {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-approval-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                isApproved,
              }),
            }
          );
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      }

      toast({
        title: isApproved ? 'Utilisateur approuvé' : 'Utilisateur refusé',
        description: isApproved 
          ? "L'utilisateur a été notifié par email"
          : "L'utilisateur a été notifié par email",
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              Administration
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les utilisateurs et les accès
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un utilisateur</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouvel utilisateur avec un compte pré-validé
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      placeholder="Jean"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      placeholder="Dupont"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="jean.dupont@exemple.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe temporaire</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createUser} disabled={isCreating}>
                  {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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

        {/* Mobile: Tabbed Card View */}
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'all')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="relative">
                En attente
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">Tous ({users.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : users.filter(u => !u.is_approved).length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-success mb-3" />
                    <p className="text-muted-foreground">Aucune inscription en attente</p>
                  </CardContent>
                </Card>
              ) : (
                users
                  .filter(u => !u.is_approved)
                  .map((user) => (
                    <MobileUserCard
                      key={user.id}
                      user={user}
                      updatingUser={updatingUser}
                      onUpdateApproval={updateApproval}
                      onUpdateRole={updateRole}
                      onResetPassword={resetPassword}
                      onDeleteUser={deleteUser}
                    />
                  ))
              )}
            </TabsContent>
            
            <TabsContent value="all" className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun utilisateur inscrit
                </p>
              ) : (
                users.map((user) => (
                  <MobileUserCard
                    key={user.id}
                    user={user}
                    updatingUser={updatingUser}
                    onUpdateApproval={updateApproval}
                    onUpdateRole={updateRole}
                    onResetPassword={resetPassword}
                    onDeleteUser={deleteUser}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        ) : (
          /* Desktop: Table View */
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
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {updatingUser === user.user_id || updatingUser === user.email ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  {/* Approval button */}
                                  {user.is_approved ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateApproval(user.user_id, false)}
                                    >
                                      <UserX className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => updateApproval(user.user_id, true)}
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </Button>
                                  )}
                                  
                                  {/* Reset password */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => resetPassword(user.email, `${user.first_name} ${user.last_name}`)}
                                    title="Réinitialiser le mot de passe"
                                  >
                                    <KeyRound className="w-4 h-4" />
                                  </Button>
                                  
                                  {/* Delete user */}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        title="Supprimer l'utilisateur"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Cette action est irréversible. {user.first_name} {user.last_name} ({user.email}) sera définitivement supprimé.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteUser(user.user_id, `${user.first_name} ${user.last_name}`)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveLayout>
  );
}
