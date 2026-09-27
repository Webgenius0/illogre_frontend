"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  KeyRound,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import {
  useGoogleAuthSettings,
  useUpdateGoogleAuthSettings,
} from "@/hooks/settings.api";
import { toast } from "sonner";
import GoogleSvg from "@/components/svg/GoogleSvg";

export default function GoogleAuthSettingsCard() {
  const { data: responseData, isLoading } = useGoogleAuthSettings();
  const { mutate: updateGoogleAuth, isPending: isUpdating } =
    useUpdateGoogleAuthSettings();

  const settings = responseData?.data || responseData || {};

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const [showSecret, setShowSecret] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (settings) {
      setClientId(settings.google_client_id || "");
      setClientSecret(settings.google_client_secret || "");
      
      const defaultRedirect = typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "http://localhost:3000/auth/callback";

      setRedirectUri(settings.google_redirect_uri || defaultRedirect);
      setIsEnabled(settings.google_auth_enabled ?? true);
    }
  }, [settings]);

  const jsOrigin = (() => {
    try {
      if (!redirectUri) return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const u = new URL(redirectUri.startsWith("http") ? redirectUri : `http://${redirectUri}`);
      return u.origin;
    } catch {
      return typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    }
  })();

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(jsOrigin);
    setCopiedOrigin(true);
    toast.success("Authorized JavaScript Origin copied to clipboard!");
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  const handleCopyRedirectUri = () => {
    if (!redirectUri) return;
    navigator.clipboard.writeText(redirectUri);
    setCopiedRedirect(true);
    toast.success("Redirect URI copied to clipboard!");
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      google_client_id: clientId,
      google_redirect_uri: redirectUri,
      google_auth_enabled: isEnabled,
    };

    // Only include secret if user explicitly typed a new unmasked secret
    if (
      clientSecret &&
      !clientSecret.includes("••••") &&
      clientSecret !== "••••••••"
    ) {
      payload.google_client_secret = clientSecret;
    }

    updateGoogleAuth(payload);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center justify-center min-h-[300px]">
        <Spinner className="size-6 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <GoogleSvg />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Google OAuth Settings
            </h2>
            <p className="text-sm font-medium text-gray-400">
              Configure dynamic Google Social Login credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shrink-0">
          <span className="text-xs font-semibold text-gray-600">
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            className="data-[state=checked]:bg-[#12A150]"
          />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client ID */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-gray-700 block">
            Google Client ID <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
            className="h-10 bg-white border-gray-200 text-xs font-medium focus:border-gray-900 focus:ring-0"
          />
        </div>

        {/* Client Secret */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-gray-700 block">
            Google Client Secret
          </label>
          <div className="relative group">
            <Input
              type={showSecret ? "text" : "password"}
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxx"
              className="h-10 bg-white border-gray-200 text-xs font-medium pr-10 focus:border-gray-900 focus:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Authorized JavaScript Origin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-gray-700 block">
              Authorized JavaScript Origin
            </label>
            <span className="text-[11px] text-gray-400 font-medium">
              Google Console Origin
            </span>
          </div>
          <div className="relative flex items-center">
            <Input
              type="text"
              readOnly
              value={jsOrigin}
              className="h-10 bg-gray-50 border-gray-200 text-xs font-mono text-gray-600 pr-24 cursor-text"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyOrigin}
              className="absolute right-1.5 h-7 text-xs font-semibold px-3 rounded-lg border-gray-200 hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copiedOrigin ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Authorized Redirect URI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-gray-700 block">
              Authorized Redirect URI
            </label>
            <span className="text-[11px] text-gray-400 font-medium">
              Google Console Redirect URI
            </span>
          </div>
          <div className="relative flex items-center">
            <Input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              placeholder="e.g. https://doaminname/auth/callback"
              className="h-10 bg-white border-gray-200 text-xs font-mono text-gray-700 pr-24 focus:border-gray-900 focus:ring-0"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyRedirectUri}
              className="absolute right-1.5 h-7 text-xs font-semibold px-3 rounded-lg border-gray-200 hover:bg-gray-100 flex items-center gap-1.5"
            >
              {copiedRedirect ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <BookOpen size={14} className="text-emerald-600" />
            <span>{showInstructions ? "Hide Setup Guide" : "View Setup Guide"}</span>
          </button>

          <Button
            type="submit"
            disabled={isUpdating}
            className="h-10 bg-gray-900 hover:bg-black text-white px-8 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            {isUpdating && <Spinner className="size-4 text-white" />}
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Inline Setup Guide */}
      {showInstructions && (
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/80 space-y-3 text-xs font-sans animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <HelpCircle className="text-emerald-600" size={16} />
              Google OAuth Setup Guide
            </h3>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold underline text-[11px]"
            >
              Google Cloud Console
              <ExternalLink size={11} />
            </a>
          </div>

          <ol className="space-y-2 text-gray-600 font-normal leading-relaxed list-decimal list-inside text-[11px]">
            <li className="pl-1">
              Go to <strong className="text-gray-900">Google Cloud Console</strong> & create/select your project.
            </li>
            <li className="pl-1">
              Navigate to <strong className="text-gray-900">APIs & Services &gt; Credentials</strong>.
            </li>
            <li className="pl-1">
              Click <strong className="text-gray-900">+ Create Credentials &gt; OAuth client ID</strong>.
            </li>
            <li className="pl-1">
              Set Application type: <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px] text-gray-800">Web application</span>.
            </li>
            <li className="pl-1">
              Under <strong className="text-gray-900">Authorized JavaScript origins</strong>, paste:
              <span className="ml-1 font-mono text-emerald-800 font-semibold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                {jsOrigin}
              </span>
            </li>
            <li className="pl-1">
              Under <strong className="text-gray-900">Authorized redirect URIs</strong>, paste:
              <span className="ml-1 font-mono text-emerald-800 font-semibold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                {redirectUri}
              </span>
              <p className="mt-1 text-[10px] text-gray-500 font-sans">
                💡 <em>Note: If testing via ngrok or staging, also add your ngrok/staging URL (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-emerald-800 border border-emerald-200">https://your-ngrok-domain.ngrok-free.dev/auth/callback</code>) to Google Console.</em>
              </p>
            </li>
            <li className="pl-1">
              Copy <strong className="text-gray-900">Client ID & Secret</strong> into this form and click <strong className="text-gray-900">Save Settings</strong>.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
