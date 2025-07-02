
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Users, Shield, Globe } from 'lucide-react';

interface EnhancedUserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  userTypeFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onUserTypeFilterChange: (value: string) => void;
}

export function EnhancedUserFilters({
  searchTerm,
  roleFilter,
  userTypeFilter,
  onSearchChange,
  onRoleFilterChange,
  onUserTypeFilterChange
}: EnhancedUserFiltersProps) {
  const activeFiltersCount = [
    roleFilter !== 'all',
    userTypeFilter !== 'all',
    searchTerm.length > 0
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onSearchChange('');
    onRoleFilterChange('all');
    onUserTypeFilterChange('all');
  };

  return (
    <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search by name, email, or ID..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="min-w-[200px]">
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <SelectValue placeholder="Filter by role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Type Filter */}
          <div className="min-w-[200px]">
            <Select value={userTypeFilter} onValueChange={onUserTypeFilterChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="real">Real Users</SelectItem>
                <SelectItem value="demo">Demo Users</SelectItem>
                <SelectItem value="mspace_client">Mspace Clients</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Active filters:
            </span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}
            {roleFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Role: {roleFilter}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onRoleFilterChange('all')}
                />
              </Badge>
            )}
            {userTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {userTypeFilter}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => onUserTypeFilterChange('all')}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
