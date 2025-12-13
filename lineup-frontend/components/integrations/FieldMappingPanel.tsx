import { useState } from 'react';
import { FieldMapping, IntegrationField } from '@/types/integrations';
import { mockSourceFields, mockTargetFields, mockFieldMappings } from '@/lib/integrations-mock-data';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { ArrowRight, Plus, Trash2, HelpCircle, CheckCircle, AlertTriangle, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface FieldMappingPanelProps {
  integrationId: string;
}

export function FieldMappingPanel({ integrationId }: FieldMappingPanelProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>(mockFieldMappings);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);

  const sourceFields = mockSourceFields;
  const targetFields = mockTargetFields;

  const handleAddMapping = () => {
    const newMapping: FieldMapping = {
      id: `map-${Date.now()}`,
      integrationId,
      sourceField: '',
      sourceType: '',
      targetField: '',
      targetType: '',
      required: false,
      validated: false,
    };
    setMappings([...mappings, newMapping]);
  };

  const handleRemoveMapping = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id));
  };

  const handleSourceChange = (mappingId: string, fieldName: string) => {
    const field = sourceFields.find((f) => f.name === fieldName);
    setMappings(mappings.map((m) =>
      m.id === mappingId
        ? { ...m, sourceField: fieldName, sourceType: field?.type || '', validated: false }
        : m
    ));
  };

  const handleTargetChange = (mappingId: string, fieldName: string) => {
    const field = targetFields.find((f) => f.name === fieldName);
    setMappings(mappings.map((m) =>
      m.id === mappingId
        ? { ...m, targetField: fieldName, targetType: field?.type || '', validated: false }
        : m
    ));
  };

  const handleTransformChange = (mappingId: string, transform: string) => {
    setMappings(mappings.map((m) =>
      m.id === mappingId ? { ...m, transform, validated: false } : m
    ));
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);

    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const errors: string[] = [];
    const requiredTargets = targetFields.filter((f) => f.required).map((f) => f.name);
    const mappedTargets = mappings.filter((m) => m.targetField).map((m) => m.targetField);

    requiredTargets.forEach((req) => {
      if (!mappedTargets.includes(req)) {
        const field = targetFields.find((f) => f.name === req);
        errors.push(`Required field "${field?.label}" is not mapped`);
      }
    });

    mappings.forEach((m) => {
      if (m.sourceType && m.targetType && m.sourceType !== m.targetType && !m.transform) {
        errors.push(`Type mismatch: ${m.sourceField} (${m.sourceType}) → ${m.targetField} (${m.targetType}). Add a transform rule.`);
      }
    });

    setValidationResult({ valid: errors.length === 0, errors });
    setMappings(mappings.map((m) => ({ ...m, validated: errors.length === 0 })));
    setIsValidating(false);

    if (errors.length === 0) {
      toast.success('Field mappings validated successfully');
    }
  };

  const handleAutoMap = () => {
    const autoMapped = sourceFields.map((source) => {
      const matchingTarget = targetFields.find(
        (t) => t.name.toLowerCase().replace(/_/g, '') === source.name.toLowerCase().replace(/_/g, '')
          || t.label.toLowerCase() === source.label.toLowerCase()
      );

      if (matchingTarget) {
        return {
          id: `map-auto-${source.name}`,
          integrationId,
          sourceField: source.name,
          sourceType: source.type,
          targetField: matchingTarget.name,
          targetType: matchingTarget.type,
          required: matchingTarget.required,
          validated: false,
        };
      }
      return null;
    }).filter(Boolean) as FieldMapping[];

    setMappings(autoMapped);
    toast.success(`Auto-mapped ${autoMapped.length} fields`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Field Mapping</h3>
          <p className="text-sm text-muted-foreground">Map source fields to target fields</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoMap}>
            <Wand2 className="mr-2 h-4 w-4" />
            Auto-Map
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddMapping}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>
      </div>

      {validationResult && !validationResult.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationResult?.valid && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription>All field mappings are valid and ready for sync.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr,40px,1fr,120px,40px] gap-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Source Field</span>
          <span></span>
          <span>Target Field</span>
          <span>Transform</span>
          <span></span>
        </div>

        {/* Mappings */}
        {mappings.map((mapping) => (
          <div
            key={mapping.id}
            className={cn(
              "grid grid-cols-[1fr,40px,1fr,120px,40px] gap-2 items-center p-2 rounded-lg border",
              mapping.validated ? "border-emerald-200 bg-emerald-50/50" : "border-border"
            )}
          >
            <Select value={mapping.sourceField} onValueChange={(v) => handleSourceChange(mapping.id, v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select source..." />
              </SelectTrigger>
              <SelectContent>
                {sourceFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <div className="flex items-center gap-2">
                      <span>{field.label}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{field.type}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <Select value={mapping.targetField} onValueChange={(v) => handleTargetChange(mapping.id, v)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select target..." />
              </SelectTrigger>
              <SelectContent>
                {targetFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <div className="flex items-center gap-2">
                      <span>{field.label}</span>
                      {field.required && <span className="text-destructive">*</span>}
                      <Badge variant="outline" className="text-[10px] px-1 py-0">{field.type}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Input
                placeholder="Transform"
                value={mapping.transform || ''}
                onChange={(e) => handleTransformChange(mapping.id, e.target.value)}
                className="h-9 text-sm pr-7"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Optional transform rule (e.g., UPPERCASE, DATE_FORMAT, LOOKUP_MAP)</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveMapping(mapping.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {mappings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No field mappings configured.</p>
            <p className="text-xs mt-1">Click "Add Mapping" or "Auto-Map" to get started.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={handleValidate} disabled={isValidating}>
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate Mappings
            </>
          )}
        </Button>
        <Button size="sm" disabled={!validationResult?.valid}>
          Save Mappings
        </Button>
      </div>
    </div>
  );
}
