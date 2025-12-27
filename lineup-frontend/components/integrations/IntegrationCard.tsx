import { cn } from '@/lib/utils';
import { Integration } from '@/types/integrations';
import { providerLogos, providerColors } from '@/lib/integrations-mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Settings, RefreshCw, AlertCircle, CheckCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (id: string) => void;
  onConnect: (id: string) => void;
  onSync?: (id: string) => void;
  isConnecting?: boolean;
  isSyncing?: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
  connected: { label: 'Connected', variant: 'default', icon: CheckCircle },
  disconnected: { label: 'Disconnected', variant: 'secondary', icon: Clock },
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle },
  syncing: { label: 'Syncing', variant: 'outline', icon: Loader2 },
  pending_auth: { label: 'Pending Auth', variant: 'outline', icon: Clock },
  auth_required: { label: 'Auth Required', variant: 'destructive', icon: AlertTriangle },
};

export function IntegrationCard({ integration, onConfigure, onConnect, onSync, isConnecting, isSyncing }: IntegrationCardProps) {
  const status = statusConfig[integration.status] || statusConfig.disconnected;
  const StatusIcon = status.icon;
  const isConnected = integration.status === 'connected' || integration.status === 'syncing';
  const isAuthRequired = integration.status === 'auth_required';
  const supportedObjects = integration.supportedObjects || [];

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
            <h3 className="font-semibold text-foreground">{integration.name || integration.provider}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{integration.description || ''}</p>
          </div>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1">
          <StatusIcon className={cn("h-3 w-3", integration.status === 'syncing' && "animate-spin")} />
          {status.label}
        </Badge>
      </div>

      {/* Auth Required Warning Banner */}
      {isAuthRequired && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Authentication Expired</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {(integration as any).lastError || 'OAuth token expired or revoked. Please reconnect to resume syncing.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {supportedObjects.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-1.5">
            {supportedObjects.slice(0, 4).map((obj) => (
              <span key={obj} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                {obj}
              </span>
            ))}
            {supportedObjects.length > 4 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground cursor-help">
                    +{supportedObjects.length - 4}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {supportedObjects.slice(4).join(', ')}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {integration.lastSyncAt && (
        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <RefreshCw className="h-3 w-3" />
          Last sync: {formatDistanceToNow(integration.lastSyncAt, { addSuffix: true })}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
        {isAuthRequired ? (
          /* Auth Required - Show prominent Reconnect button */
          <>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onConnect(integration.id)}
              disabled={isConnecting}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {isConnecting ? 'Reconnecting...' : 'Reconnect Now'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onConfigure(integration.id)}>
              <Settings className="h-4 w-4" />
            </Button>
          </>
        ) : isConnected ? (
          <>
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onSync?.(integration.id)}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onConfigure(integration.id)}>
              <Settings className="h-4 w-4" />
            </Button>
          </>
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

