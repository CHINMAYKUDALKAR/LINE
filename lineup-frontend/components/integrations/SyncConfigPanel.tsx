import { useState } from 'react';
import { Integration, SyncDirection, SyncCadence, ConflictResolution } from '@/types/integrations';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, ArrowLeftRight, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SyncConfigPanelProps {
  integration: Integration;
  onSave: (config: Integration['config']) => void;
}

const directionOptions: { value: SyncDirection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'inbound', label: 'Inbound Only', icon: ArrowLeft },
  { value: 'outbound', label: 'Outbound Only', icon: ArrowRight },
  { value: 'bidirectional', label: 'Bidirectional', icon: ArrowLeftRight },
];

const cadenceOptions: { value: SyncCadence; label: string }[] = [
  { value: 'realtime', label: 'Real-time (webhooks)' },
  { value: '15min', label: 'Every 15 minutes' },
  { value: '1hour', label: 'Every hour' },
  { value: '6hours', label: 'Every 6 hours' },
  { value: 'daily', label: 'Daily' },
  { value: 'manual', label: 'Manual only' },
];

const conflictOptions: { value: ConflictResolution; label: string; description: string }[] = [
  { value: 'source_wins', label: 'Source Wins', description: 'Data from source system always takes precedence' },
  { value: 'target_wins', label: 'Target Wins', description: 'Existing data in target system is preserved' },
  { value: 'latest_wins', label: 'Latest Wins', description: 'Most recently updated record takes precedence' },
  { value: 'manual', label: 'Manual Review', description: 'Flag conflicts for manual resolution' },
];

export function SyncConfigPanel({ integration, onSave }: SyncConfigPanelProps) {
  const [config, setConfig] = useState(integration.config || {
    syncDirection: 'inbound' as SyncDirection,
    syncCadence: '1hour' as SyncCadence,
    conflictResolution: 'latest_wins' as ConflictResolution,
    enableWebhooks: false,
    webhookUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave(config);
    toast.success('Sync configuration saved');
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground">Sync Configuration</h3>
        <p className="text-sm text-muted-foreground">Configure how data is synchronized</p>
      </div>

      {/* Sync Direction */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>Sync Direction</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Inbound: Import data from external system. Outbound: Export data to external system. Bidirectional: Sync both ways.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {directionOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setConfig({ ...config, syncDirection: opt.value })}
                className={`p-3 rounded-lg border text-center transition-all ${
                  config.syncDirection === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sync Cadence */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Sync Frequency</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>How often to sync data. Real-time uses webhooks for instant updates.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={config.syncCadence}
          onValueChange={(v) => setConfig({ ...config, syncCadence: v as SyncCadence })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cadenceOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conflict Resolution */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Conflict Resolution</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>How to handle conflicts when the same record is modified in both systems.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={config.conflictResolution}
          onValueChange={(v) => setConfig({ ...config, conflictResolution: v as ConflictResolution })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conflictOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div>
                  <span>{opt.label}</span>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Webhooks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Enable Webhooks</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Receive real-time notifications when data changes in the external system.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            checked={config.enableWebhooks}
            onCheckedChange={(checked) => setConfig({ ...config, enableWebhooks: checked })}
          />
        </div>

        {config.enableWebhooks && (
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              placeholder="https://api.yourapp.com/webhooks/integration"
              value={config.webhookUrl || ''}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              The external system will send event notifications to this URL.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>
    </div>
  );
}
