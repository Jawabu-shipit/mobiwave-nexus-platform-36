import React, { useState, KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Plus } from 'lucide-react';

interface CustomTagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  suggestions?: string[];
}

export function CustomTagsInput({
  tags,
  onChange,
  label = "Tags",
  placeholder = "Add tags...",
  suggestions = []
}: CustomTagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const commonTags = [
    'VIP', 'Customer', 'Lead', 'Prospect', 'Partner', 'Vendor',
    'Family', 'Friend', 'Colleague', 'Client', 'Subscriber',
    'High Priority', 'Follow Up', 'Newsletter', 'Marketing'
  ];

  const allSuggestions = [...suggestions, ...commonTags].filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Display current tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-gray-50 min-h-[40px]">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input for new tags */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && allSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {allSuggestions.slice(0, 8).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => addTag(suggestion)}
              >
                <Plus className="w-3 h-3 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick add common tags */}
      {inputValue === '' && tags.length === 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Quick add:</div>
          <div className="flex flex-wrap gap-1">
            {commonTags.slice(0, 6).map((tag, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => addTag(tag)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}