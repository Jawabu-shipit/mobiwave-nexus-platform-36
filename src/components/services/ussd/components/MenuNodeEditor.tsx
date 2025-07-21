
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Settings } from 'lucide-react';
import { MenuNode } from '../types';

interface MenuNodeEditorProps {
  node: MenuNode;
  index: number;
  isRoot: boolean;
  isEditing: boolean;
  onUpdate: (updates: Partial<MenuNode>) => void;
  onDelete: () => void;
  onSetAsRoot: () => void;
  onToggleEdit: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionIndex: number, value: string) => void;
  onRemoveOption: (optionIndex: number) => void;
}

export function MenuNodeEditor({
  node,
  index,
  isRoot,
  isEditing,
  onUpdate,
  onDelete,
  onSetAsRoot,
  onToggleEdit,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}: MenuNodeEditorProps) {
  return (
    <Card className={`border-l-4 ${isRoot ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {isRoot ? 'Root Menu' : `Menu ${index + 1}`}
            </Badge>
            <Badge variant={node.isEndNode ? 'destructive' : 'default'}>
              {node.isEndNode ? 'End Node' : 'Menu Node'}
            </Badge>
            {!node.text.trim() && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Empty Text
              </Badge>
            )}
            {!node.isEndNode && node.options.length === 0 && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                No Options
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {!isRoot && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSetAsRoot}
                title="Set as root menu"
              >
                Root
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleEdit}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`text-${node.id}`}>Menu Text *</Label>
          <Textarea
            id={`text-${node.id}`}
            value={node.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Enter the text that will be displayed to users"
            rows={3}
            className={!node.text.trim() ? 'border-orange-300 focus:border-orange-500' : ''}
          />
          <p className="text-xs text-gray-500 mt-1">
            Characters: {node.text.length}/160
          </p>
        </div>

        {!node.isEndNode && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Menu Options *</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={onAddOption}
                disabled={node.options.length >= 9}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option ({node.options.length}/9)
              </Button>
            </div>
            <div className="space-y-2">
              {node.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-2">
                  <div className="w-8 h-9 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                    {optionIndex + 1}
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => onUpdateOption(optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  {node.options.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveOption(optionIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={node.isEndNode}
                    onChange={(e) => onUpdate({ isEndNode: e.target.checked })}
                  />
                  <span className="text-sm">End Node (terminates session)</span>
                </label>
              </div>
              {node.isEndNode && (
                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  End nodes terminate the USSD session.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
