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
    <div className="min-h-screen bg-[#F7F9FC]">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="border-b border-[#E5E7EB] bg-[#FFFFFF]">
          <div className="w-full px-8 py-8">
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
        <motion.div variants={staggerItem} className="w-full px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-[#FFFFFF] border border-[#E5E7EB] h-auto p-1">
              <TabsTrigger value="branding" className="py-2">Branding</TabsTrigger>
              <TabsTrigger value="domain" className="py-2">Domain & URLs</TabsTrigger>
              <TabsTrigger value="auth" className="py-2">Auth & SSO</TabsTrigger>
              <TabsTrigger value="security" className="py-2">Security</TabsTrigger>
              <TabsTrigger value="email" className="py-2">Email/SMTP</TabsTrigger>
              <TabsTrigger value="calendar" className="py-2">Calendar</TabsTrigger>
              <TabsTrigger value="api-keys" className="py-2">API Keys</TabsTrigger>
              <TabsTrigger value="audit" className="py-2">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="branding">
              <BrandingTab />
            </TabsContent>

            <TabsContent value="domain">
              <DomainTab />
            </TabsContent>

            <TabsContent value="auth">
              <AuthSSOTab />
            </TabsContent>

            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>

            <TabsContent value="email">
              <EmailTab />
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarSchedulingTab />
            </TabsContent>

            <TabsContent value="api-keys">
              <ApiKeysTab />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLogsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
