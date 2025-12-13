import { useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tenant } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface TenantSelectorProps {
  tenants: Tenant[];
  currentTenantId: string;
  collapsed: boolean;
  onTenantChange: (tenantId: string) => void;
}

export function TenantSelector({
  tenants,
  currentTenantId,
  collapsed,
  onTenantChange
}: TenantSelectorProps) {
  const currentTenant = tenants.find((t) => t.id === currentTenantId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg',
            'hover:bg-muted/50 transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {currentTenant?.logo ? (
              <img
                src={currentTenant.logo}
                alt={currentTenant.name}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <Building2 className="w-4 h-4 text-primary" />
            )}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentTenant?.name || 'Select Tenant'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56 bg-popover border border-border shadow-lg"
        sideOffset={8}
      >
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => onTenantChange(tenant.id)}
            className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              {tenant.logo ? (
                <img
                  src={tenant.logo}
                  alt={tenant.name}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-primary" />
              )}
            </div>
            <span className="flex-1 text-sm truncate">{tenant.name}</span>
            {tenant.id === currentTenantId && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
