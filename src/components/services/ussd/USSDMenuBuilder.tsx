
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Menu, AlertCircle, CheckCircle } from 'lucide-react';
import { MenuNode } from './types';
import { MenuNodeEditor } from './components/MenuNodeEditor';

interface USSDMenuBuilderProps {
  menuStructure: MenuNode[];
  onUpdateMenu: (menu: MenuNode[]) => void;
}

export function USSDMenuBuilder({ menuStructure, onUpdateMenu }: USSDMenuBuilderProps) {
  const [editingNode, setEditingNode] = useState<string | null>(null);

  const validateMenuStructure = () => {
    const issues = [];
    
    const hasRoot = menuStructure.some(node => node.id === 'root');
    if (!hasRoot && menuStructure.length > 0) {
      issues.push('No root menu found. Consider setting the first menu as root.');
    }
    
    const emptyMenus = menuStructure.filter(node => !node.text.trim());
    if (emptyMenus.length > 0) {
      issues.push(`${emptyMenus.length} menu(s) have empty text.`);
    }
    
    const menusWithoutOptions = menuStructure.filter(node => !node.isEndNode && node.options.length === 0);
    if (menusWithoutOptions.length > 0) {
      issues.push(`${menusWithoutOptions.length} menu(s) have no options but are not end nodes.`);
    }
    
    return issues;
  };

  const addMenuNode = () => {
    const newNode: MenuNode = {
      id: `node-${Date.now()}`,
      text: 'Enter menu text here',
      options: ['Option 1'],
      isEndNode: false
    };
    
    const updatedMenu = [...menuStructure, newNode];
    onUpdateMenu(updatedMenu);
    setEditingNode(newNode.id);
  };

  const updateMenuNode = (nodeId: string, updates: Partial<MenuNode>) => {
    const updatedMenu = menuStructure.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    );
    onUpdateMenu(updatedMenu);
  };

  const deleteMenuNode = (nodeId: string) => {
    if (menuStructure.length <= 1) return;
    
    const updatedMenu = menuStructure.filter(node => node.id !== nodeId);
    onUpdateMenu(updatedMenu);
    
    if (editingNode === nodeId) {
      setEditingNode(null);
    }
  };

  const addOption = (nodeId: string) => {
    const node = menuStructure.find(n => n.id === nodeId);
    if (node && node.options.length < 9) {
      const newOptions = [...node.options, `Option ${node.options.length + 1}`];
      updateMenuNode(nodeId, { options: newOptions });
    }
  };

  const updateOption = (nodeId: string, optionIndex: number, value: string) => {
    const node = menuStructure.find(n => n.id === nodeId);
    if (node) {
      const newOptions = [...node.options];
      newOptions[optionIndex] = value;
      updateMenuNode(nodeId, { options: newOptions });
    }
  };

  const removeOption = (nodeId: string, optionIndex: number) => {
    const node = menuStructure.find(n => n.id === nodeId);
    if (node && node.options.length > 1) {
      const newOptions = node.options.filter((_, index) => index !== optionIndex);
      updateMenuNode(nodeId, { options: newOptions });
    }
  };

  const setAsRootNode = (nodeId: string) => {
    const updatedMenu = menuStructure.map(node => ({
      ...node,
      id: node.id === nodeId ? 'root' : (node.id === 'root' ? `node-${Date.now()}` : node.id)
    }));
    onUpdateMenu(updatedMenu);
  };

  const validationIssues = validateMenuStructure();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            USSD Menu Structure
          </span>
          <div className="flex items-center gap-2">
            {validationIssues.length > 0 ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationIssues.length} Issues
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3" />
                Valid
              </Badge>
            )}
            <Button onClick={addMenuNode} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Menu
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationIssues.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Menu Validation Issues:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    {validationIssues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {menuStructure.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Menu className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">No menu nodes created yet.</p>
            <Button onClick={addMenuNode}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Menu
            </Button>
          </div>
        ) : (
          menuStructure.map((node, index) => (
            <MenuNodeEditor
              key={node.id}
              node={node}
              index={index}
              isRoot={node.id === 'root'}
              isEditing={editingNode === node.id}
              onUpdate={(updates) => updateMenuNode(node.id, updates)}
              onDelete={() => deleteMenuNode(node.id)}
              onSetAsRoot={() => setAsRootNode(node.id)}
              onToggleEdit={() => setEditingNode(editingNode === node.id ? null : node.id)}
              onAddOption={() => addOption(node.id)}
              onUpdateOption={(optionIndex, value) => updateOption(node.id, optionIndex, value)}
              onRemoveOption={(optionIndex) => removeOption(node.id, optionIndex)}
            />
          ))
        )}

        {menuStructure.length > 0 && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Tips:</strong>
            <ul className="mt-1 space-y-1">
              <li>• The root menu is the first menu users will see</li>
              <li>• Keep menu text under 160 characters</li>
              <li>• USSD supports up to 9 options per menu</li>
              <li>• End nodes terminate the session</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
