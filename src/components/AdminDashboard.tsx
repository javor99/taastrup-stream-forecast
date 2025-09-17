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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <CardTitle className="text-sm font-medium">Municipality Access</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isSuperAdmin ? 'Full' : 'View Only'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isSuperAdmin ? 'Create/Edit municipalities' : 'View municipalities & stations'}
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