import { cn } from '@/lib/utils';
import { Integration } from '@/types/integrations';
import { providerLogos, providerColors } from '@/lib/integrations-mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Settings, RefreshCw, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (id: string) => void;
  onConnect: (id: string) => void;
  isConnecting?: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
  connected: { label: 'Connected', variant: 'default', icon: CheckCircle },
  disconnected: { label: 'Disconnected', variant: 'secondary', icon: Clock },
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle },
  syncing: { label: 'Syncing', variant: 'outline', icon: Loader2 },
  pending_auth: { label: 'Pending Auth', variant: 'outline', icon: Clock },
};

export function IntegrationCard({ integration, onConfigure, onConnect, isConnecting }: IntegrationCardProps) {
  const status = statusConfig[integration.status];
  const StatusIcon = status.icon;
  const isConnected = integration.status === 'connected' || integration.status === 'syncing';

  return (
    <div className="bg-card rounded-lg border border-border p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm",
            providerColors[integration.provider]
          )}>
            {providerLogos[integration.provider]}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{integration.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
          </div>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1">
          <StatusIcon className={cn("h-3 w-3", integration.status === 'syncing' && "animate-spin")} />
          {status.label}
        </Badge>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap gap-1.5">
          {integration.supportedObjects.slice(0, 4).map((obj) => (
            <span key={obj} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
              {obj}
            </span>
          ))}
          {integration.supportedObjects.length > 4 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground cursor-help">
                  +{integration.supportedObjects.length - 4}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {integration.supportedObjects.slice(4).join(', ')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {integration.lastSyncAt && (
        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <RefreshCw className="h-3 w-3" />
          Last sync: {formatDistanceToNow(integration.lastSyncAt, { addSuffix: true })}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
        {isConnected ? (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onConfigure(integration.id)}>
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        ) : integration.status === 'pending_auth' ? (
          <Button size="sm" className="flex-1" onClick={() => onConnect(integration.id)}>
            Complete Setup
          </Button>
        ) : integration.status === 'error' ? (
          <>
            <Button variant="destructive" size="sm" className="flex-1" onClick={() => onConnect(integration.id)}>
              Reconnect
            </Button>
            <Button variant="outline" size="sm" onClick={() => onConfigure(integration.id)}>
              <Settings className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" className="flex-1" onClick={() => onConnect(integration.id)}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
