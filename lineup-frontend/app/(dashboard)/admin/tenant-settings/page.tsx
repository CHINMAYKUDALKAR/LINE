"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

// Tab Components
import BrandingTab from "./(tabs)/BrandingTab";
import DomainTab from "./(tabs)/DomainTab";
import AuthSSOTab from "./(tabs)/AuthSSOTab";
import SecurityTab from "./(tabs)/SecurityTab";
import EmailTab from "./(tabs)/EmailTab";
import ApiKeysTab from "./(tabs)/ApiKeysTab";
import AuditLogsTab from "./(tabs)/AuditLogsTab";
import CalendarSchedulingTab from "./(tabs)/CalendarSchedulingTab";
import HiringStagesTab from "./(tabs)/HiringStagesTab";

export default function TenantSettings() {
  const { isManager } = useUserRole();
  const [activeTab, setActiveTab] = useState("branding");

  // RBAC Check
  if (!isManager) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4 opacity-60" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Unauthorized
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access Tenant Settings. Only Admins and
            Managers can access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="w-full p-4 md:px-8 md:py-8">
            <h1 className="text-3xl font-bold text-foreground">
              Tenant Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure organization-wide settings including branding, domain,
              authentication, and security.
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={staggerItem} className="w-full p-4 md:px-8 md:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-2 p-1 bg-muted/40 backdrop-blur-sm border border-border/50 mb-8 rounded-lg">
              <TabsTrigger value="branding" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Branding</TabsTrigger>
              <TabsTrigger value="domain" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Domain & URLs</TabsTrigger>
              <TabsTrigger value="auth" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Auth & SSO</TabsTrigger>
              <TabsTrigger value="security" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
              <TabsTrigger value="email" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Email/SMTP</TabsTrigger>
              <TabsTrigger value="calendar" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Calendar</TabsTrigger>
              <TabsTrigger value="hiring-stages" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Hiring Stages</TabsTrigger>
              <TabsTrigger value="api-keys" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">API Keys</TabsTrigger>
              <TabsTrigger value="audit" className="flex-1 min-w-[120px] py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Audit Logs</TabsTrigger>
            </TabsList>

            <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm">
              <TabsContent value="branding" className="mt-0">
                <BrandingTab />
              </TabsContent>

              <TabsContent value="domain" className="mt-0">
                <DomainTab />
              </TabsContent>

              <TabsContent value="auth" className="mt-0">
                <AuthSSOTab />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityTab />
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <EmailTab />
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <CalendarSchedulingTab />
              </TabsContent>

              <TabsContent value="hiring-stages" className="mt-0">
                <HiringStagesTab />
              </TabsContent>

              <TabsContent value="api-keys" className="mt-0">
                <ApiKeysTab />
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                <AuditLogsTab />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}

