// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2025 Your Name
// Part of AquaMonitor/InnoTech-TaskForce. See LICENSE for license terms.

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchMunicipalities, createMunicipality, updateMunicipality, deleteMunicipality, assignStationsToMunicipality } from '@/services/api';
import { MunicipalityDetail } from './MunicipalityDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MapPin, Eye } from 'lucide-react';

interface Municipality {
  id: number;
  name: string;
  region: string;
  population: number | null;
  area_km2: number | null;
  description: string | null;
  station_count: number;
  created_at: string;
  updated_at?: string | null;
  created_by: string | null;
  updated_by?: string | null;
}

interface MunicipalityManagerProps {
  onMunicipalityUpdate?: () => void;
}

export const MunicipalityManager: React.FC<MunicipalityManagerProps> = ({ onMunicipalityUpdate }) => {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMunicipality, setEditingMunicipality] = useState<Municipality | null>(null);
  const [viewingMunicipalityId, setViewingMunicipalityId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    population: '',
    area_km2: '',
    description: ''
  });

  const { isSuperAdmin, isAdmin, getToken } = useAuth();
  const { toast } = useToast();

  const loadMunicipalities = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const data = await fetchMunicipalities(token || undefined);
      // Ensure station_count is present
      const mappedMunicipalities = data.municipalities.map(m => ({ 
        ...m, 
        station_count: m.station_count || 0 
      }));
      setMunicipalities(mappedMunicipalities);
    } catch (error) {
      console.error('Failed to load municipalities:', error);
      toast({
        title: "Error",
        description: "Failed to load municipalities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isSuperAdmin) {
      loadMunicipalities();
    }
  }, [isAdmin, isSuperAdmin]);

  const resetForm = () => {
    setFormData({
      name: '',
      region: '',
      population: '',
      area_km2: '',
      description: ''
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can create municipalities",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = getToken();
      await createMunicipality({
        name: formData.name,
        region: formData.region,
        population: formData.population ? parseInt(formData.population) : null,
        area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : null,
        description: formData.description || null
      }, token || undefined);

      toast({
        title: "Success",
        description: "Municipality created successfully",
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadMunicipalities();
      onMunicipalityUpdate?.();
    } catch (error) {
      console.error('Failed to create municipality:', error);
      toast({
        title: "Error",
        description: "Failed to create municipality",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin || !editingMunicipality) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can edit municipalities",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = getToken();
      await updateMunicipality(editingMunicipality.id, {
        name: formData.name,
        region: formData.region,
        population: formData.population ? parseInt(formData.population) : null,
        area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : null,
        description: formData.description || null
      }, token || undefined);

      toast({
        title: "Success",
        description: "Municipality updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingMunicipality(null);
      resetForm();
      loadMunicipalities();
      onMunicipalityUpdate?.();
    } catch (error) {
      console.error('Failed to update municipality:', error);
      toast({
        title: "Error",
        description: "Failed to update municipality",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (municipality: Municipality) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only superadmins can delete municipalities",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${municipality.name}?`)) {
      return;
    }

    try {
      const token = getToken();
      await deleteMunicipality(municipality.id, token || undefined);

      toast({
        title: "Success",
        description: "Municipality deleted successfully",
      });

      loadMunicipalities();
      onMunicipalityUpdate?.();
    } catch (error) {
      console.error('Failed to delete municipality:', error);
      toast({
        title: "Error",
        description: "Failed to delete municipality",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (municipality: Municipality) => {
    setEditingMunicipality(municipality);
    setFormData({
      name: municipality.name,
      region: municipality.region,
      population: municipality.population ? municipality.population.toString() : '',
      area_km2: municipality.area_km2 ? municipality.area_km2.toString() : '',
      description: municipality.description || ''
    });
    setIsEditDialogOpen(true);
  };

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p>Administrator privileges required to manage municipalities.</p>
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
          <h2 className="text-2xl font-bold">Municipality Management</h2>
          <p className="text-muted-foreground">Manage municipalities and their water level monitoring stations</p>
        </div>
        {isSuperAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Municipality
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Municipality</DialogTitle>
                <DialogDescription>
                  Add a new municipality to the system. Superadmin access required.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="population">Population</Label>
                    <Input
                      id="population"
                      type="number"
                      value={formData.population}
                      onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Area (km²)</Label>
                    <Input
                      id="area"
                      type="number"
                      step="0.01"
                      value={formData.area_km2}
                      onChange={(e) => setFormData(prev => ({ ...prev, area_km2: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Municipality</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {municipalities.map((municipality) => (
          <Card key={municipality.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {municipality.name}
                  </CardTitle>
                  <CardDescription>{municipality.region}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {municipality.station_count} stations
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingMunicipalityId(municipality.id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isSuperAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(municipality)}
                          title="Edit Municipality"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(municipality)}
                          title="Delete Municipality"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Population:</span>
                  <div>{municipality.population ? municipality.population.toLocaleString() : 'Not specified'}</div>
                </div>
                <div>
                  <span className="font-medium">Area:</span>
                  <div>{municipality.area_km2 ? `${municipality.area_km2} km²` : 'Not specified'}</div>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <div>{new Date(municipality.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="font-medium">Updated:</span>
                  <div>{municipality.updated_at ? new Date(municipality.updated_at).toLocaleDateString() : 'Not updated'}</div>
                </div>
              </div>
              {(municipality.created_by || municipality.updated_by) && (
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex flex-col gap-1">
                    {municipality.created_by && (
                      <span>Created by: {municipality.created_by}</span>
                    )}
                    {municipality.updated_by && municipality.updated_by !== municipality.created_by && (
                      <span>Last updated by: {municipality.updated_by}</span>
                    )}
                  </div>
                </div>
              )}
              {municipality.description && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {municipality.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Municipality</DialogTitle>
            <DialogDescription>
              Update municipality information. Superadmin access required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-region">Region</Label>
              <Input
                id="edit-region"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-population">Population</Label>
                <Input
                  id="edit-population"
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-area">Area (km²)</Label>
                <Input
                  id="edit-area"
                  type="number"
                  step="0.01"
                  value={formData.area_km2}
                  onChange={(e) => setFormData(prev => ({ ...prev, area_km2: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Municipality</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {municipalities.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Municipalities</h3>
            <p className="text-muted-foreground mb-4">
              No municipalities have been created yet.
            </p>
            {isSuperAdmin && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Municipality
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Municipality Detail Modal */}
      <MunicipalityDetail
        municipalityId={viewingMunicipalityId || 0}
        isOpen={viewingMunicipalityId !== null}
        onClose={() => setViewingMunicipalityId(null)}
      />
    </div>
  );
};