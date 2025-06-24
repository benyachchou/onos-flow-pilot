
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jsonTemplates } from '../data/jsonTemplates';

interface TemplateManagerProps {
  onLoadTemplate: (template: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onLoadTemplate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates JSON pour ONOS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(jsonTemplates).map(([name, template]) => (
          <div key={name} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</h4>
              <Button 
                size="sm" 
                onClick={() => onLoadTemplate(name)}
              >
                Utiliser
              </Button>
            </div>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-48">
              {template}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
