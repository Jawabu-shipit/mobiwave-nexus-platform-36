
import React from 'react';
import { FileX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-8">
      <FileX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No activation requests</h3>
      <p className="text-gray-500">
        All service activation requests will appear here for review.
      </p>
    </div>
  );
}
