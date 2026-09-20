"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnectIntegration, useConnectShopify } from "@/hooks/owner.api";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface ConnectIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "gmail" | "outlook" | "whatsapp" | "smtp" | "shopify" | null;
  onSuccess?: () => void;
}

export function ConnectIntegrationModal({
  open,
  onOpenChange,
  provider,
  onSuccess,
}: ConnectIntegrationModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [imapPassword, setImapPassword] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [imapEncryption, setImapEncryption] = useState("ssl");

  // Custom SMTP state variables
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpEncryption, setSmtpEncryption] = useState("tls");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");

  // Shopify state variables
  const [shop, setShop] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: connectIntegration, isPending: isPendingIntegration } = useConnectIntegration();
  const { mutate: connectShopify, isPending: isPendingShopify } = useConnectShopify();

  const isPending = isPendingIntegration || isPendingShopify;

  // Reset form when provider changes or modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setPhone("");
      setUsername("");
      setShop("");
      setRedirectUrl("");
      setStatus("form");
      setErrorMessage("");

      if (provider === "gmail") {
        setImapPassword("");
        setImapHost("imap.gmail.com");
        setImapPort("993");
        setImapEncryption("ssl");
      } else if (provider === "outlook") {
        setImapPassword("");
        setImapHost("outlook.office365.com");
        setImapPort("993");
        setImapEncryption("ssl");
      } else if (provider === "smtp") {
        setSmtpHost("");
        setSmtpPort("587");
        setSmtpUsername("");
        setSmtpPassword("");
        setSmtpEncryption("tls");
        setFromEmail("");
        setFromName("");
      } else {
        setImapPassword("");
        setImapHost("");
        setImapPort("");
        setImapEncryption("");
      }
    }
  }, [open, provider]);

  const providerName =
    provider === "shopify"
      ? "Shopify"
      : provider === "gmail"
        ? "Gmail"
        : provider === "outlook"
          ? "Outlook"
          : provider === "whatsapp"
            ? "WhatsApp"
            : provider === "smtp"
              ? "Custom SMTP / Email"
              : "Integration";

  const handleConnect = () => {
    if (provider === "shopify") {
      if (!shop.trim()) {
        toast.error("Please enter your Shopify store URL");
        return;
      }
      const formattedShop = shop.replace(/^https?:\/\//, "").replace(/\/$/, "");
      connectShopify(
        { shop: formattedShop },
        {
          onSuccess: (data) => {
            toast.success("Shopify store connected successfully!");
            if (data?.url) {
              setRedirectUrl(data.url);
            }
            setStatus("success");
            onSuccess?.();
          },
          onError: (err: any) => {
            const msg =
              err?.response?.data?.message || "Failed to connect Shopify store";
            toast.error(msg);
            setErrorMessage(msg);
            setStatus("error");
          },
        },
      );
      return;
    }

    let payload: any = {};

    if (provider === "gmail") {
      if (!email) {
        toast.error("Please enter your email");
        return;
      }
      if (!imapPassword) {
        toast.error("Please enter your IMAP/App password");
        return;
      }
      if (!imapHost) {
        toast.error("Please enter the IMAP host");
        return;
      }
      if (!imapPort) {
        toast.error("Please enter the IMAP port");
        return;
      }
      payload = {
        provider,
        email,
        app_password: imapPassword,
        imap_password: imapPassword,
        imap_host: imapHost,
        imap_port: Number(imapPort),
        imap_encryption: imapEncryption,
      };
    } else if (provider === "outlook") {
      payload = {
        provider,
        email,
      };
    } else if (provider === "whatsapp") {
      if (!phone || !username) {
        toast.error("Please enter phone and username");
        return;
      }
      payload = { provider, phone, username };
    } else if (provider === "smtp") {
      if (!smtpHost) {
        toast.error("Please enter the SMTP host address");
        return;
      }
      if (!smtpPort) {
        toast.error("Please enter the SMTP port");
        return;
      }
      if (!smtpUsername) {
        toast.error("Please enter the SMTP login username");
        return;
      }
      if (!smtpPassword) {
        toast.error("Please enter the SMTP password");
        return;
      }

      payload = {
        provider: "smtp",
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_username: smtpUsername,
        smtp_password: smtpPassword,
        smtp_encryption: smtpEncryption,
        from_email: fromEmail || smtpUsername,
        from_name: fromName,
      };
    }

    connectIntegration(payload, {
      onSuccess: () => {
        toast.success(`${providerName} connected successfully!`);
        setStatus("success");
        onSuccess?.();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message || `Failed to connect ${providerName}`;
        toast.error(msg);
        setErrorMessage(msg);
        setStatus("error");
      },
    });
  };

  const isSubmitDisabled =
    isPending ||
    (provider === "shopify" && !shop.trim()) ||
    ((provider === "gmail" || provider === "outlook") &&
      (!email || !imapPassword || !imapHost || !imapPort)) ||
    (provider === "smtp" &&
      (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword)) ||
    (provider === "whatsapp" && (!phone || !username));

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTimeout(() => setStatus("form"), 200);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent
        className={
          status === "form"
            ? provider === "smtp"
              ? "sm:max-w-lg!"
              : "sm:max-w-106!"
            : "sm:max-w-md p-8 sm:p-12 rounded-2xl gap-0 border-none text-center bg-white"
        }
      >
        {status === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Connect {providerName}</DialogTitle>
              <DialogDescription>
                Enter your {providerName} details to connect.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {provider === "shopify" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="shop" className="text-sm font-medium">
                    Shop Name / Store URL
                  </label>
                  <Input
                    id="shop"
                    placeholder="e.g. mystore.myshopify.com"
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                  />
                  <span className="text-[11px] text-muted-foreground leading-normal">
                    Tip: Enter your Shopify store domain to authorize integration.
                  </span>
                </div>
              )}
              {provider === "gmail" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={`e.g. hello@${
                        provider === "gmail" ? "gmail.com" : "outlook.com"
                      }`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="imapPassword"
                      className="text-sm font-medium"
                    >
                      IMAP Password / App Password
                    </label>
                    <Input
                      id="imapPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={imapPassword}
                      onChange={(e) => setImapPassword(e.target.value)}
                    />
                    {provider === "gmail" && (
                      <span className="text-[11px] text-muted-foreground leading-normal">
                        Tip: Gmail requires you to generate an{" "}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-primary transition-colors"
                        >
                          App Password
                        </a>{" "}
                        and ensure IMAP access is enabled in your Gmail
                        settings.
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2 flex flex-col gap-2">
                      <label htmlFor="imapHost" className="text-sm font-medium">
                        IMAP Host
                      </label>
                      <Input
                        id="imapHost"
                        placeholder="imap.gmail.com"
                        value={imapHost}
                        onChange={(e) => setImapHost(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-2">
                      <label htmlFor="imapPort" className="text-sm font-medium">
                        Port
                      </label>
                      <Input
                        id="imapPort"
                        type="number"
                        placeholder="993"
                        value={imapPort}
                        onChange={(e) => setImapPort(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-2">
                      <label
                        htmlFor="imapEncryption"
                        className="text-sm font-medium"
                      >
                        Encryption
                      </label>
                      <Select
                        value={imapEncryption}
                        onValueChange={(val) => setImapEncryption(val || "")}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-transparent text-sm focus:outline-hidden">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-150 rounded-md shadow-md">
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {provider === "smtp" && (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2 flex flex-col gap-2">
                      <label htmlFor="smtpHost" className="text-sm font-medium">
                        SMTP Host Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="smtpHost"
                        placeholder="e.g. smtp.domain.com"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-2">
                      <label htmlFor="smtpPort" className="text-sm font-medium">
                        Port <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="smtpPort"
                        type="number"
                        placeholder="587"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-2">
                      <label htmlFor="smtpEncryption" className="text-sm font-medium">
                        Encryption
                      </label>
                      <Select
                        value={smtpEncryption}
                        onValueChange={(val) => setSmtpEncryption(val || "tls")}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-transparent text-sm focus:outline-hidden">
                          <SelectValue placeholder="TLS" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-150 rounded-md shadow-md">
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="smtpUsername" className="text-sm font-medium">
                      SMTP Login / Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="smtpUsername"
                      type="text"
                      placeholder="e.g. support@domain.com"
                      value={smtpUsername}
                      onChange={(e) => setSmtpUsername(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="smtpPassword" className="text-sm font-medium">
                      SMTP Password / App Key <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="Enter password or app key"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="fromEmail" className="text-sm font-medium">
                        From Email (Optional)
                      </label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder={smtpUsername || "support@domain.com"}
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="fromName" className="text-sm font-medium">
                        Sender Name (Optional)
                      </label>
                      <Input
                        id="fromName"
                        placeholder="e.g. Support Team"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {provider === "outlook" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={`e.g. hello@outlook.com`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {provider === "whatsapp" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      placeholder="e.g. +123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      placeholder="e.g. My Business WA"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isSubmitDisabled}
                className="text-foreground"
              >
                {isPending && <Spinner />}
                Connect
              </Button>
            </DialogFooter>
          </>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-full border border-primary/20 flex items-center justify-center bg-gray-50 relative shadow-[inset_0_0_20px_rgba(202,229,85,0.1)]">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-white/30 shadow-lg">
                  <Check className="text-secondary w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {providerName} Connected!
            </h2>
            <p className="text-[#6B6B6B] text-base mb-8 font-medium">
              Your {providerName} is now successfully connected to Tixolve.
            </p>
            <Button
              onClick={() => {
                if (redirectUrl) {
                  window.location.href = redirectUrl;
                } else {
                  setStatus("form");
                  onOpenChange(false);
                }
              }}
              className="w-full h-12 bg-linear-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-black font-semibold text-base rounded-lg transition-all duration-300"
            >
              Continue
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <div className="size-20 rounded-full border border-red-500/20 flex items-center justify-center bg-gray-50 relative shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-linear-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-white/30 shadow-lg">
                  <X className="text-red-500 w-8 h-8 sm:w-10 sm:h-10 stroke-[3px]" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Connection Failed</h2>
            <p className="text-[#6B6B6B] text-base mb-8 font-medium">
              {errorMessage}
            </p>
            <Button
              onClick={() => setStatus("form")}
              variant="outline"
              className="w-full h-12 font-semibold text-base rounded-lg transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
