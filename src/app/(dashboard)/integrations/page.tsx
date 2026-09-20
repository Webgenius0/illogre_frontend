"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useSelector } from "react-redux";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import { ShopifyConnectModal } from "@/components/integrations/ShopifyConnectModal";
import { ShopifyProcessingModal } from "@/components/integrations/ShopifyProcessingModal";
import { ConnectIntegrationModal } from "@/components/integrations/ConnectIntegrationModal";
import { ActionModal } from "@/components/shared/ActionModal";
import { useIntegrations, useDisconnectIntegration } from "@/hooks/owner.api";
import { useBillingOverview } from "@/hooks/billing.api";
import { toast } from "sonner";
import shopify from "../../../assets/shopify.png";
import outlook from "../../../assets/outlook.png";
import gmail from "../../../assets/gmail.png";
import slack from "../../../assets/slack.png";
import whatsapp from "../../../assets/whatsapp.png";
import mail from "@/assets/mail.png";

const ICONS: Record<string, any> = {
  shopify,
  outlook,
  gmail,
  slack,
  whatsapp,
  mail,
};

function getLogoBg(icon: string) {
  switch (icon) {
    case "webhook":
      return "bg-[#6366F1]";
    case "instagram":
      return "bg-[#0078D4]";
    case "klaviyo":
    case "zendesk":
      return "bg-black";
    case "gorgias":
      return "bg-[#6361FF]";
    case "zoho":
      return "bg-[#D82121]";
    default:
      return "bg-white text-black border border-gray-200";
  }
}

export default function IntegrationsPage() {
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionModalDetails, setActionModalDetails] = useState({
    title: "Upgrade Plan Required",
    description:
      "Starter plan users can only integrate Gmail. Please upgrade your subscription plan to connect other tools.",
  });
  const [activeProvider, setActiveProvider] = useState<
    "gmail" | "outlook" | "whatsapp" | "smtp" | "shopify" | null
  >(null);

  const user = useSelector((state: any) => state.auth.user);
  const { data: billingRes } = useBillingOverview();
  const billingData = billingRes?.data || {};

  console.log(billingData);

  const currentPlanName = (billingData?.current_plan?.name || "")
    .toString()
    .toLowerCase();

  const isStarterPlan = currentPlanName.includes("starter");

  const { data: integrationsResponse, isLoading, refetch } = useIntegrations();
  const { mutate: disconnectIntegration } = useDisconnectIntegration();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("shopify_connected") === "true" ||
        urlParams.get("success") === "shopify"
      ) {
        setIsProcessingModalOpen(true);
        toast.success("Shopify store connected successfully!");
        refetch();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [refetch]);

  const handleAction = (app: any) => {
    if (app.is_connected) {
      disconnectIntegration(app.integration_id, {
        onSuccess: () => {
          toast.success(`${app.name} disconnected successfully`);
          refetch();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || `Failed to disconnect ${app.name}`,
          );
        },
      });
    } else {
      if (isStarterPlan && app.id !== "gmail" && app.id !== "shopify") {
        setActionModalDetails({
          title: "Upgrade Plan Required",
          description: `Starter plan users can only integrate Gmail. Please upgrade your subscription plan to connect ${app.name}.`,
        });
        setIsActionModalOpen(true);
        return;
      }

      if (["gmail", "smtp", "outlook", "whatsapp", "shopify"].includes(app.id)) {
        setActiveProvider(app.id);
        setIsConnectModalOpen(true);
      } else {
        toast.info("Integration coming soon");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between animate-pulse"
          >
            <div className="mb-3 space-y-3">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-gray-200" />
                <div className="h-8 w-20 rounded-full bg-gray-200" />
              </div>

              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded" />

                <div className="space-y-1">
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-10 w-28 rounded-xl bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const integrations = integrationsResponse?.data || [];

  const connectedApps = integrations.filter((app: any) => app.is_connected);
  const migrateApps = integrations.filter(
    (app: any) => !app.is_connected && app.type === "migrate",
  );
  const availableApps = integrations.filter(
    (app: any) => !app.is_connected && app.type !== "migrate",
  );

  const mapToCardProps = (app: any) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    status: app.is_connected
      ? "Connected"
      : app.status === "available"
        ? "Available"
        : "Migrate",
    lastSynced: app.last_synced || "",
    logoBg: getLogoBg(app.icon),
    initial: app?.name?.charAt(0) || "",
    logoUrl: ICONS[app.icon],
  });

  return (
    <div className=" animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-1">Integrations</h1>
        <p className="text-muted-foreground text-sm">
          Connect Tixolve with your favorite tools and platforms.
        </p>
      </div>
      <div className="space-y-12 mt-8">
        {/* Connected Section */}
        {connectedApps.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Connected</h2>
              <p className="text-gray-500 text-sm font-medium">
                Your active integrations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectedApps.map((app: any) => (
                <IntegrationCard
                  key={app.id}
                  app={mapToCardProps(app)}
                  type="connected"
                  onAction={() => handleAction(app)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Section */}
        {availableApps.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Available</h2>
              <p className="text-gray-500 text-sm font-medium">
                Connect new tools to your workspace
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableApps.map((app: any) => (
                <IntegrationCard
                  key={app.id}
                  app={mapToCardProps(app)}
                  type="available"
                  onAction={() => handleAction(app)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Migrate Section */}
        {migrateApps.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Migrate</h2>
              <p className="text-gray-500 text-sm font-medium">
                Import data from other platforms
              </p>
            </div>

            {/* Important Banner */}
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-4 rounded-md flex items-center gap-3">
              <Info className="size-4 text-[#B45309]" />

              <p className="text-sm font-medium text-[#B45309]">
                <span className="font-semibold">Important:</span> This is a
                one-time import. No ongoing sync will be maintained.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {migrateApps.map((app: any) => (
                <IntegrationCard
                  key={app.id}
                  app={mapToCardProps(app)}
                  type="migrate"
                  onAction={() => handleAction(app)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <ShopifyConnectModal
        open={isShopifyModalOpen}
        onOpenChange={setIsShopifyModalOpen}
        onSuccess={() => refetch()}
      />

      <ConnectIntegrationModal
        open={isConnectModalOpen}
        onOpenChange={setIsConnectModalOpen}
        provider={activeProvider}
        onSuccess={() => refetch()}
      />

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={actionModalDetails.title}
        description={actionModalDetails.description}
      />
    </div>
  );
}
