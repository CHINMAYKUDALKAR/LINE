import { useState } from 'react';
import { Integration } from '@/types/integrations';
import { providerLogos, providerColors, providerDocs } from '@/lib/integrations-mock-data';
import { AuthFlowPanel } from './AuthFlowPanel';
import { FieldMappingPanel } from './FieldMappingPanel';
import { SyncConfigPanel } from './SyncConfigPanel';
import { WebhookEventLog } from './WebhookEventLog';
import { IntegrationMetricsPanel } from './IntegrationMetricsPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MoreVertical, ExternalLink, RefreshCw, Trash2, Power, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationDetailPanelProps {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (integration: Integration) => void;
  onDisconnect?: (provider: string) => Promise<void>;
  onSync?: (provider: string) => Promise<void>;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
  connected: { label: 'Connected', variant: 'default', icon: CheckCircle },
  disconnected: { label: 'Disconnected', variant: 'secondary', icon: Clock },
  error: { label: 'Error', variant: 'destructive', icon: AlertCircle },
  syncing: { label: 'Syncing', variant: 'outline', icon: Loader2 },
  pending_auth: { label: 'Pending Auth', variant: 'outline', icon: Clock },
};

export function IntegrationDetailPanel({ integration, isOpen, onClose, onUpdate, onDisconnect, onSync }: IntegrationDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!integration) return null;

  const status = statusConfig[integration.status] || statusConfig.disconnected;
  const StatusIcon = status.icon;
  const isConnected = integration.status === 'connected' || integration.status === 'syncing';
  const needsAuth = !isConnected; // Any status that isn't connected needs auth

  const handleDisconnect = async () => {
    if (onDisconnect) {
      setIsDisconnecting(true);
      try {
        await onDisconnect(integration.provider);
        onUpdate({ ...integration, status: 'disconnected' });
        onClose();
      } finally {
        setIsDisconnecting(false);
      }
    } else {
      toast.success('Integration disconnected');
      onUpdate({ ...integration, status: 'disconnected' });
      onClose();
    }
  };

  const handleTriggerSync = async () => {
    if (onSync) {
      setIsSyncing(true);
      try {
        await onSync(integration.provider);
        onUpdate({ ...integration, status: 'syncing' });
      } finally {
        setIsSyncing(false);
      }
    } else {
      toast.success('Sync initiated', { description: 'Data synchronization started.' });
      onUpdate({ ...integration, status: 'syncing' });
    }
  };

  const handleAuthComplete = () => {
    setShowAuthFlow(false);
    onUpdate({ ...integration, status: 'connected' });
    setActiveTab('mapping');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                providerColors[integration.provider]
              )}>
                {providerLogos[integration.provider]}
              </div>
              <div>
                <SheetTitle className="text-left">{integration.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    <StatusIcon className={cn("h-3 w-3", integration.status === 'syncing' && "animate-spin")} />
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isConnected && (
                  <DropdownMenuItem onClick={handleTriggerSync}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Trigger Sync
                  </DropdownMenuItem>
                )}
                {providerDocs[integration.provider] && (
                  <DropdownMenuItem asChild>
                    <a href={providerDocs[integration.provider]} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Docs
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {isConnected && (
                  <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
                    <Power className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Integration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {showAuthFlow || needsAuth ? (
            <AuthFlowPanel
              integration={integration}
              onAuthComplete={handleAuthComplete}
              onCancel={() => {
                setShowAuthFlow(false);
                if (needsAuth) onClose();
              }}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="mapping">Mapping</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <SyncConfigPanel
                  integration={integration}
                  onSave={(config) => onUpdate({ ...integration, config })}
                />
              </TabsContent>

              <TabsContent value="mapping">
                <FieldMappingPanel integrationId={integration.id} provider={integration.provider} />
              </TabsContent>

              <TabsContent value="events">
                <WebhookEventLog integrationId={integration.id} provider={integration.provider} />
              </TabsContent>

              <TabsContent value="metrics">
                <IntegrationMetricsPanel integrationId={integration.id} provider={integration.provider} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
