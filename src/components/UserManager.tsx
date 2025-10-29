import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchUsers, createUser, updateUser, deleteUser, deactivateUser, activateUser, User } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, UserCheck, UserCog, Edit, Trash2, UserX, UserPlus, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface UserManagerProps {
  onUserUpdate?: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ onUserUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'superadmin'
  });
  const [editFormData, setEditFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'user' | 'admin' | 'superadmin',
    is_active: true
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  const { isSuperAdmin, getToken, user: currentUser } = useAuth();
  const { toast } = useToast();

  const loadUsers = async () => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchUsers(token);
      setUsers(data.users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      const errorMessage = error?.message || "Failed to load users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin'
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin' as 'user' | 'admin' | 'superadmin',
      is_active: true
    });
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role === 'user' ? 'admin' : user.role, // Convert existing 'user' roles to 'admin'
      is_active: user.is_active
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can create users",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast({
        title: "Weak Password",
        description: "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&).",
        variant: "destructive",
      });
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUser({
        email: formData.email,
        password: formData.password,
        role: formData.role
      }, token);

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadUsers();
      onUserUpdate?.();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage = error?.message || "Failed to create user. Email may already exist.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin || !editingUser) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can edit users",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength if password is being changed
    if (editFormData.password.trim()) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(editFormData.password)) {
        toast({
          title: "Weak Password",
          description: "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character (@$!%*?&).",
          variant: "destructive",
        });
        return;
      }

      // Validate password confirmation
      if (editFormData.password !== editFormData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: any = {
        email: editFormData.email,
        role: editFormData.role,
        is_active: editFormData.is_active
      };

      // Only include password if it's provided
      if (editFormData.password.trim()) {
        updateData.password = editFormData.password;
      }

      await updateUser(editingUser.id, updateData, token);

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetEditForm();
      loadUsers();
      onUserUpdate?.();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorMessage = error?.message || "Failed to update user. Email may already be in use.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (user: User) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can delete users",
        variant: "destructive",
      });
      return;
    }

    if (user.id === currentUser?.id) {
      toast({
        title: "Error",
        description: "Cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    const superadminCount = users.filter(u => u.role === 'superadmin' && u.is_active).length;
    if (user.role === 'superadmin' && superadminCount <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last superadmin user",
        variant: "destructive",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteUser(user.id, token);

      toast({
        title: "Success",
        description: `User ${user.email} deleted successfully`,
      });

      loadUsers();
      onUserUpdate?.();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      const errorMessage = error?.message || "Failed to delete user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can activate/deactivate users",
        variant: "destructive",
      });
      return;
    }

    if (user.id === currentUser?.id) {
      toast({
        title: "Error",
        description: "Cannot deactivate your own account",
        variant: "destructive",
      });
      return;
    }

    const superadminCount = users.filter(u => u.role === 'superadmin' && u.is_active).length;
    if (user.role === 'superadmin' && user.is_active && superadminCount <= 1) {
      toast({
        title: "Error",
        description: "Cannot deactivate the last superadmin user",
        variant: "destructive",
      });
      return;
    }

    const token = getToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user.is_active) {
        await deactivateUser(user.id, token);
        toast({
          title: "Success",
          description: `User ${user.email} deactivated successfully`,
        });
      } else {
        await activateUser(user.id, token);
        toast({
          title: "Success",
          description: `User ${user.email} activated successfully`,
        });
      }

      loadUsers();
      onUserUpdate?.();
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      const errorMessage = error?.message || "Failed to update user status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <ShieldCheck className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p>Superadmin privileges required to manage users.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their access levels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. Superadmin access required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 8 chars, uppercase, number, special char"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'superadmin') => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Station management</SelectItem>
                    <SelectItem value="superadmin">Superadmin - Full system access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Superadmins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'superadmin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Regular Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Inactive Users</p>
                <p className="text-2xl font-bold">{users.filter(u => !u.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className={!user.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(user.role)}
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {user.email}
                      {!user.is_active && <UserX className="h-4 w-4 text-muted-foreground" />}
                    </CardTitle>
                    <CardDescription>User ID: {user.id}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {isSuperAdmin && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={user.id === currentUser?.id || (user.role === 'superadmin' && users.filter(u => u.role === 'superadmin' && u.is_active).length <= 1)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete user "{user.email}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <div className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('en-DK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Last Login:</span>
                  <div className="text-muted-foreground">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('en-DK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Access Level:</span>
                  <div className="text-muted-foreground">
                    {user.role === 'superadmin' ? 'Full system access' :
                     user.role === 'admin' ? 'Administrative access' :
                     'Read-only access'}
                  </div>
                </div>
              </div>
              {user.created_by && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Created by: {user.created_by}
                  {user.updated_by && user.updated_by !== user.created_by && (
                    <span> • Updated by: {user.updated_by}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Superadmin access required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editFormData.password}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 8 chars, uppercase, number, special char"
                  minLength={8}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="edit-confirmPassword"
                  type={showEditConfirmPassword ? "text" : "password"}
                  value={editFormData.confirmPassword}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  minLength={8}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                >
                  {showEditConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-role">User Role</Label>
              <Select value={editFormData.role} onValueChange={(value: 'admin' | 'superadmin') => setEditFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Station management</SelectItem>
                  <SelectItem value="superadmin">Superadmin - Full system access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editFormData.is_active}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="edit-active">Account Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {users.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground mb-4">
              No users have been created yet.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Helper function for role badge variants
  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'user':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Helper component for user list
  const UserList = ({ users: userList }: { users: User[] }) => {
    return (
      <div className="space-y-4">
        {userList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No users found in this category</p>
          </div>
        ) : (
          userList.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                      <span className={`inline-flex items-center gap-1 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {user.is_active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                      {user.last_login && (
                        <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(user)}
                >
                  {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete the user "{user.email}"? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(user)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };
};