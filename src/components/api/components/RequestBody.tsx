
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { jsonTemplates } from '../data/jsonTemplates';

interface RequestBodyProps {
  method: string;
  body: string;
  setBody: (body: string) => void;
}

export const RequestBody: React.FC<RequestBodyProps> = ({
  method,
  body,
  setBody
}) => {
  const loadJsonTemplate = (template: string) => {
    setBody(jsonTemplates[template as keyof typeof jsonTemplates]);
  };

  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">Corps de la requête (JSON)</label>
        <Select onValueChange={loadJsonTemplate}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Charger un template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flow">Flow Rule</SelectItem>
            <SelectItem value="batchFlows">Batch Flows</SelectItem>
            <SelectItem value="intent">Intent</SelectItem>
            <SelectItem value="device">Device</SelectItem>
            <SelectItem value="host">Host</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="meter">Meter</SelectItem>
            <SelectItem value="filterObjective">Filter Objective</SelectItem>
            <SelectItem value="forwardObjective">Forward Objective</SelectItem>
            <SelectItem value="nextObjective">Next Objective</SelectItem>
            <SelectItem value="configuration">Configuration</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder='{"priority": 40000, "deviceId": "of:0000000000000001"}'
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={12}
        className="font-mono"
      />
      {body && (
        <div className="mt-2 text-sm text-gray-600">
          <strong>Aperçu JSON:</strong>
          <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto max-h-32">
            {body}
          </pre>
        </div>
      )}
    </div>
  );
};
