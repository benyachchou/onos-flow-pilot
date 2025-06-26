
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play } from 'lucide-react';

interface RequestFormProps {
  method: string;
  setMethod: (method: string) => void;
  url: string;
  setUrl: (url: string) => void;
  customUrl: string;
  setCustomUrl: (url: string) => void;
  urlMode: 'preset' | 'custom';
  setUrlMode: (mode: 'preset' | 'custom') => void;
  loading: boolean;
  onExecute: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  method, setMethod,
  url, setUrl,
  customUrl, setCustomUrl,
  urlMode, setUrlMode,
  loading,
  onExecute
}) => {
  return (
    <div className="flex gap-4">
      <Select value={method} onValueChange={setMethod}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PUT">PUT</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
          <SelectItem value="PATCH">PATCH</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex gap-2 flex-1">
        <Select value={urlMode} onValueChange={(value: 'preset' | 'custom') => setUrlMode(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preset">Preset</SelectItem>
            <SelectItem value="custom">Custom URL</SelectItem>
          </SelectContent>
        </Select>
        
        {urlMode === 'custom' ? (
          <Input
            className="flex-1"
            placeholder="https://api.example.com/endpoint ou /devices"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        ) : (
          <Input
            className="flex-1"
            placeholder="/devices ou /flows/{deviceId}"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}
      </div>
      
      <Button onClick={onExecute} disabled={loading} className="min-w-24">
        <Play className="mr-2 h-4 w-4" />
        {loading ? 'Envoi...' : 'Envoyer'}
      </Button>
    </div>
  );
};
