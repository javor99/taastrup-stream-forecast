import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StreamGrid } from './StreamGrid';
import { StationManager } from './StationManager';
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
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Welcome to dashboard</h2>
              <p className="text-muted-foreground">
                This dashboard allows you to manage the water monitoring system. Use the tabs above to navigate between different sections.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Stations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    View and manage water monitoring stations across different municipalities. Monitor real-time data and receive updates.
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>View all station data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Subscribe to real-time updates</span>
                    </div>
                    {(isAdmin || isSuperAdmin) && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Add new monitoring stations</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Update warning levels</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Municipalities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage municipalities and their associated monitoring stations.
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>View municipality information</span>
                    </div>
                    {isSuperAdmin ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Add new municipalities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Edit and delete municipalities</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span>Editing requires superadmin access</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage user accounts and their access permissions.
                  </p>
                  <div className="space-y-1 text-sm">
                    {isSuperAdmin ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Create new users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Manage user roles</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Activate/deactivate accounts</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        <span>Only superadmins can manage users</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Access Level</CardTitle>
                <CardDescription>What you can do with your current role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className="text-sm">
                    {user?.role}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {isSuperAdmin ? 'Full system access' : 'Administrative access with some restrictions'}
                  </span>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">✓ You can:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• View all monitoring stations</li>
                      <li>• Subscribe to real-time station updates</li>
                      <li>• See municipality information</li>
                      {(isAdmin || isSuperAdmin) && (
                        <>
                          <li>• Add new monitoring stations</li>
                          <li>• Update station warning levels</li>
                        </>
                      )}
                      {isSuperAdmin && (
                        <>
                          <li>• Create and edit municipalities</li>
                          <li>• Manage user accounts</li>
                          <li>• Full system administration</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  {!isSuperAdmin && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">✗ You cannot:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Create or delete municipalities</li>
                        <li>• Manage user accounts</li>
                        <li>• Access superadmin features</li>
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'stations' && (
          <div className="space-y-6">
            <StationManager />
            <StreamGrid isAdminView={true} />
          </div>
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