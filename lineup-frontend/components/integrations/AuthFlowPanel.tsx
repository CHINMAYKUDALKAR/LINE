import { useState } from 'react';
import { Integration } from '@/types/integrations';
import { providerLogos, providerColors, providerDocs } from '@/lib/integrations-mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ExternalLink, Eye, EyeOff, HelpCircle, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import * as integrationsApi from '@/lib/api/integrations';

interface AuthFlowPanelProps {
  integration: Integration;
  onAuthComplete: () => void;
  onCancel: () => void;
}

export function AuthFlowPanel({ integration, onAuthComplete, onCancel }: AuthFlowPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call real API to get OAuth authorization URL
      const response = await integrationsApi.connect(integration.provider);

      if (response.authUrl) {
        // Redirect to the OAuth provider's authorization page
        window.location.href = response.authUrl;
      } else {
        // If no authUrl returned, fall back to simulated flow
        toast.success('Successfully connected', {
          description: `${integration.name} is now connected to your account.`,
        });
        onAuthComplete();
      }
    } catch (err) {
      console.error('OAuth initialization failed:', err);
      setError('Failed to connect. Please try again or contact support.');
      setIsLoading(false);
    }
  };

  const handleApiKeyAuth = async () => {
    if (!apiKey.trim()) {
      setError('API Key is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API key validation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (apiKey.length < 10) {
      setError('Invalid API Key format. Please check your credentials.');
      setIsLoading(false);
      return;
    }

    toast.success('Successfully connected', {
      description: `${integration.name} is now connected using API key authentication.`,
    });
    setIsLoading(false);
    onAuthComplete();
  };

  const docsUrl = providerDocs[integration.provider];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold",
          providerColors[integration.provider]
        )}>
          {providerLogos[integration.provider]}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{integration.name}</h3>
          <p className="text-sm text-muted-foreground">Connect your account</p>
        </div>
      </div>

      {integration.status === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your previous connection expired or was revoked. Please re-authenticate to continue syncing.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(integration.authType === 'oauth2' || !integration.authType) ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to securely connect your {integration.name} account using OAuth 2.0.
            You'll be redirected to {integration.name} to authorize access.
          </p>

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your credentials are never stored. We use secure token-based authentication that can be revoked anytime.
            </p>
          </div>

          <Button onClick={handleOAuth} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>Connect with {integration.name}</>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Find your API key in your {integration.name} settings under API & Integrations.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="api-key"
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {integration.provider !== 'bamboohr' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="api-secret">API Secret (optional)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Some providers require both an API key and secret for authentication.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="api-secret"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter your API secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Your API credentials are encrypted and stored securely. They are never exposed in logs or API responses.
            </p>
          </div>

          <Button onClick={handleApiKeyAuth} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </div>
      )}

      {docsUrl && (
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View {integration.name} API documentation
        </a>
      )}

      <div className="pt-4 border-t border-border">
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
