import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StreamGrid } from './StreamGrid';
import { MunicipalityManager } from './MunicipalityManager';
import { UserManager } from './UserManager';
import { Users, Settings, LogOut, MapPin, Database } from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'stations' | 'municipalities' | 'users'>('overview');

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {isSuperAdmin ? 'Superadmin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isSuperAdmin ? 'Full system access' : 'Administrative access'}
              </p>
            </div>
            <Button onClick={onClose} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'stations' ? 'default' : 'outline'}
              onClick={() => setActiveTab('stations')}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Stations
            </Button>
            <Button
              variant={activeTab === 'municipalities' ? 'default' : 'outline'}
              onClick={() => setActiveTab('municipalities')}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Municipalities
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Role</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={isSuperAdmin ? 'default' : 'secondary'}>
                      {user?.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isSuperAdmin ? 'Full system access' : 'Administrative access'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Municipality CRUD</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isSuperAdmin ? 'Full CRUD' : 'View Only'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isSuperAdmin ? 'Create/Read/Update/Delete' : 'Read access only'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Management</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isSuperAdmin ? 'Full CRUD' : 'Disabled'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isSuperAdmin ? 'Create/Read/Update/Delete' : 'No access'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Station Management</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isAdmin || isSuperAdmin ? 'Enabled' : 'Disabled'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin || isSuperAdmin ? 'Update min/max values' : 'View only access'}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Municipality Operations
                  </CardTitle>
                  <CardDescription>Available municipality CRUD operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Badge variant="outline">✓ List All Municipalities</Badge>
                    <Badge variant="outline">✓ Get Specific Municipality</Badge>
                    {isSuperAdmin && (
                      <>
                        <Badge variant="default">✓ Create New Municipality</Badge>
                        <Badge variant="default">✓ Update Municipality</Badge>
                        <Badge variant="default">✓ Delete Municipality</Badge>
                        <Badge variant="default">✓ Assign Stations</Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Operations
                  </CardTitle>
                  <CardDescription>Available user CRUD operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {isSuperAdmin ? (
                      <>
                        <Badge variant="default">✓ List All Users</Badge>
                        <Badge variant="default">✓ Create New User</Badge>
                        <Badge variant="default">✓ Update User</Badge>
                        <Badge variant="default">✓ Delete User</Badge>
                        <Badge variant="default">✓ Activate/Deactivate</Badge>
                      </>
                    ) : (
                      <Badge variant="secondary">❌ Superadmin Only</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>API Status & Access</CardTitle>
                <CardDescription>Current API endpoint accessibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">✅ Public Endpoints</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• GET /municipalities</li>
                      <li>• GET /municipalities/:id</li>
                      <li>• GET /municipalities/stations</li>
                      <li>• GET /auth/users</li>
                      <li>• POST /auth/login</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🔒 Protected Operations</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• POST /municipalities (Create)</li>
                      <li>• PUT /municipalities/:id (Update)</li>
                      <li>• DELETE /municipalities/:id (Delete)</li>
                      <li>• POST /auth/register (Create User)</li>
                      <li>• PUT/DELETE /auth/users (User CRUD)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'stations' && (
          <StreamGrid />
        )}

        {activeTab === 'municipalities' && (
          <MunicipalityManager />
        )}

        {activeTab === 'users' && (
          <UserManager />
        )}
      </div>
    </div>
  );
};