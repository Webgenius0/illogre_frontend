"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/Logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Printer,
  ArrowLeft,
  BookOpen,
  FileText,
  Check,
  Mail,
  Clock,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: Check,
    content:
      'By accessing or using the Tixolve customer support ticket and AI automation platform (the "Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you must not access or use the Service. These Terms apply to all visitors, users, partners, and others who access or use the Service.',
  },
  {
    id: "services",
    title: "2. Description of Services",
    icon: BookOpen,
    content:
      "Tixolve provides an intelligent ticketing dashboard and AI-driven automation services for customer support. This includes but is not limited to ticket tracking, automatic AI resolution systems, data analytics, knowledge base management, and integrations with third-party channels (such as Slack, WhatsApp, and Shopify). Tixolve reserves the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.",
  },
  {
    id: "registration",
    title: "3. Account Registration & Security",
    icon: Shield,
    content:
      "To use certain features of Tixolve, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are solely responsible for safeguarding your account password and credentials. You agree to notify us immediately of any unauthorized use of your account. Tixolve will not be liable for any loss or damage arising from your failure to comply with these security obligations.",
  },
  {
    id: "data-privacy",
    title: "4. Privacy & Data Protection",
    icon: Shield,
    content:
      "Your privacy is important to us. Our processing of personal data, customer conversations, metadata, and support logs is governed by our Privacy Policy. By using Tixolve, you acknowledge that customer conversation data may be processed via advanced language models (LLMs) to provide automated support suggestions and resolution. You represent and warrant that you have obtained all necessary consents from your end-users to process their support messages through Tixolve.",
  },
  {
    id: "integrations",
    title: "5. Third-Party Integrations",
    icon: BookOpen,
    content:
      "The Service allows you to connect with external platforms such as Shopify, Slack, Outlook, WhatsApp, and others. Your use of these integrations is subject to the terms and privacy policies of those third-party providers. Tixolve is not responsible for the performance, data practices, or availability of any third-party service you connect to your Tixolve account.",
  },
  {
    id: "billing",
    title: "6. Subscriptions & Billing",
    icon: FileText,
    content:
      "Certain parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic cycle (monthly or annually). A valid payment method is required to process payments. At the end of each billing cycle, your subscription will automatically renew under the same conditions unless you cancel it or Tixolve cancels it. You can cancel your subscription via your Billing page at any time.",
  },
  {
    id: "conduct",
    title: "7. Prohibited Conduct",
    icon: Shield,
    content:
      "You agree not to engage in any of the following prohibited activities: (a) copying, distributing, or disclosing any part of the Service in any medium; (b) using any automated system, including robots, spiders, or offline readers, to access the Service; (c) transmitting spam, chain letters, or other unsolicited emails; (d) attempting to interfere with or compromise system integrity or security; (e) taking any action that imposes an unreasonable load on our infrastructure; or (f) uploading invalid data, viruses, or other software agents through the Service.",
  },
  {
    id: "intellectual-property",
    title: "8. Intellectual Property Rights",
    icon: FileText,
    content:
      "The Service and its original content, features, and functionality (excluding user-provided data) are and will remain the exclusive property of Tixolve and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks, logos, and brand identity may not be used in connection with any product or service without the prior written consent of Tixolve.",
  },
  {
    id: "warranties",
    title: "9. Disclaimer of Warranties",
    icon: HelpCircle,
    content:
      'THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TIXOLVE MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY DISCLAIMS AND NEGATES ALL OTHER WARRANTIES, INCLUDING WITHOUT LIMITATION, IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY. FURTHER, TIXOLVE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.',
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    icon: HelpCircle,
    content:
      "IN NO EVENT SHALL TIXOLVE, ITS DIRECTORS, EMPLOYEES, PARTNERS, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.",
  },
  {
    id: "governing-law",
    title: "11. Governing Law",
    icon: BookOpen,
    content:
      "These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Tixolve operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.",
  },
  {
    id: "changes",
    title: "12. Changes to Terms",
    icon: Clock,
    content:
      "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.",
  },
  {
    id: "contact",
    title: "13. Contact Us",
    icon: Mail,
    content:
      "If you have any questions or concerns regarding these Terms and Conditions, please contact our support team at support@tixolve.com or open a ticket directly through the Tixolve helpdesk dashboard.",
  },
];

export default function TermsAndConditions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("acceptance");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const query = searchQuery.toLowerCase();
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(query) ||
        sec.content.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // Handle active section change on scroll
  useEffect(() => {
    const handleScrollEvent = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      // Find current active section
      const scrollPosition = window.scrollY + 200;
      for (const section of filteredSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, [filteredSections]);

  // Smooth scroll to target section
  const handleSectionClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = element.offsetTop - 120;
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  // Safe keyword highlighting for text search matches
  const renderHighlightedContent = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(
      `(${search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-primary/30 text-foreground px-0.5 rounded font-semibold transition-colors duration-200"
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] text-foreground font-urbanist selection:bg-primary selection:text-black">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-linear-to-r from-secondary to-primary z-50 transition-all duration-100 print:hidden"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3 sm:px-6 lg:px-8 transition-all print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src={logo}
                alt="Tixolve Logo"
                className="w-16 sm:w-20 transition-transform group-hover:scale-105"
              />
            </Link>
            <span className="h-5 w-px bg-border/80 hidden sm:inline" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:inline">
              Legal Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full shadow-xs gap-1.5 hover:border-primary/50 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to App</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-linear-to-br from-secondary/15 to-primary/25 border-b border-border/30 print:bg-white print:p-0 print:border-none print:py-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(202,229,85,0.15),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-border/40 text-xs font-semibold text-muted-foreground mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 print:hidden">
            <Clock className="size-3 text-secondary" />
            <span>Effective date: July 1, 2026</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#162943] mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            Terms & Conditions
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700">
            Please read these terms carefully before accessing or using Tixolve.
            They govern your use of our AI-driven customer support ticketing
            platform.
          </p>
        </div>
      </section>

      {/* Search & Actions Panel */}
      <section className="sticky top-12.5 z-30 bg-[#EEEEEE]/10 backdrop-blur-md py-4 border-b border-border/30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search clauses or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 w-full rounded-full border border-border bg-white shadow-2xs focus-visible:border-primary focus-visible:ring-primary/20 transition-all text-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="rounded-full shadow-2xs h-10 px-4 bg-white border border-border hover:border-primary/50 text-sm gap-2 w-full sm:w-auto"
            >
              <Printer className="size-4" />
              <span>Print Agreement</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1 print:hidden">
            <div className="sticky top-33 space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-border/50 shadow-2xs">
                <h4 className="text-sm font-bold text-[#162943] uppercase tracking-wider mb-3 px-1">
                  On this page
                </h4>
                <nav className="space-y-1 max-h-[60vh] overflow-y-auto custom_scroll pr-1">
                  {filteredSections.map((section) => {
                    const isActive = activeSection === section.id;
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-xl transition-all duration-200 text-sm ${
                          isActive
                            ? "bg-linear-to-r from-secondary/10 to-primary/20 text-[#162943] font-semibold border-l-4 border-primary"
                            : "hover:bg-gray-50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon
                          className={`size-4 shrink-0 ${isActive ? "text-secondary" : "text-muted-foreground/75"}`}
                        />
                        <span className="truncate">
                          {section.title.split(". ")[1]}
                        </span>
                        <ChevronRight
                          className={`size-3 ml-auto opacity-0 transition-opacity ${isActive ? "opacity-100" : ""}`}
                        />
                      </button>
                    );
                  })}
                  {filteredSections.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-4">
                      No matching sections
                    </p>
                  )}
                </nav>
              </div>

              {/* Need help card */}
              {/* <div className="p-5 rounded-2xl bg-linear-to-br from-secondary/5 to-primary/10 border border-border/40 shadow-3xs text-center">
                <HelpCircle className="size-8 mx-auto text-secondary mb-2" />
                <h5 className="text-sm font-bold text-[#162943] mb-1">
                  Need Clarification?
                </h5>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Have questions about Tixolve service agreements or customer
                  data protocols?
                </p>
                <a href="mailto:support@tixolve.com">
                  <Button
                    size="sm"
                    className="w-full rounded-full bg-[#162943] text-white hover:bg-black/90 h-9"
                  >
                    Contact Legal
                  </Button>
                </a>
              </div> */}
            </div>
          </aside>

          <article className="col-span-1 lg:col-span-3 print:col-span-4">
            <div className="bg-white rounded-2xl border border-border/50 shadow-xs p-6 md:p-10 lg:p-12 print:border-none print:shadow-none print:p-0">
              <div className="hidden print:block mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold">
                  Tixolve Terms and Conditions
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Effective Date: July 1, 2026 | Website: tixolve.com
                </p>
              </div>

              {/* Filter warning if any */}
              {searchQuery && (
                <div className="mb-6 px-4 py-3 bg-linear-to-r from-secondary/10 to-primary/10 rounded-xl border border-primary/20 text-sm text-muted-foreground flex items-center justify-between print:hidden animate-in fade-in duration-200">
                  <span>
                    Showing sections containing:{" "}
                    <strong className="text-foreground">"{searchQuery}"</strong>{" "}
                    ({filteredSections.length} found)
                  </span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Sections list */}
              <div className="space-y-10 md:space-y-12">
                {filteredSections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-36 group/section border-b border-gray-100 last:border-0 pb-8 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-8 rounded-full bg-linear-to-r from-secondary/10 to-primary/25 flex items-center justify-center text-secondary-foreground font-semibold group-hover/section:scale-105 transition-transform duration-200">
                        {React.createElement(section.icon, {
                          className: "size-4 text-[#162943]",
                        })}
                      </div>
                      <h2 className="text-xl font-bold text-[#162943] tracking-tight">
                        {section.title}
                      </h2>
                    </div>

                    <div className="text-muted-foreground leading-relaxed text-[15px] sm:text-base space-y-4">
                      <p>
                        {renderHighlightedContent(section.content, searchQuery)}
                      </p>
                    </div>
                  </section>
                ))}

                {filteredSections.length === 0 && (
                  <div className="text-center py-16 animate-in fade-in duration-200">
                    <div className="inline-flex size-14 rounded-full bg-gray-100 items-center justify-center text-gray-400 mb-4">
                      <Search className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#162943] mb-1">
                      No matching terms found
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                      We couldn't find any clauses matching your query. Try
                      searching for broader terms like "privacy", "account", or
                      "billing".
                    </p>
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                      className="rounded-full"
                    >
                      Clear Search Filter
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Summary Notice */}
              <div className="mt-12 p-6 rounded-2xl bg-[#F6F6F6] border border-border/40 text-sm leading-relaxed text-muted-foreground print:bg-white print:border-none print:p-0 print:mt-8">
                <h4 className="font-bold text-[#162943] mb-2 flex items-center gap-2 text-base">
                  <Shield className="size-4 text-secondary" />
                  <span>Important Legal Summary Notice</span>
                </h4>
                <p>
                  This summary is for your convenience only. In the event of any
                  discrepancies or conflicting interpretations between this
                  summary and the full text of the Terms above, the official
                  written text shall govern. Always consult with legal counsel
                  regarding company-wide software and automation tool
                  compliance.
                </p>
              </div>
            </div>
          </article>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-[#162943] text-[#F6F6F6] py-12 mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
          <div className="flex flex-col gap-2">
            <Image
              src={logo}
              alt="Tixolve"
              className="w-20 mx-auto sm:mx-0 filter invert brightness-200"
            />
            <p className="text-xs text-gray-400">
              Modern AI ticket resolutions & seamless customer support
              integrations.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-semibold text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">
              App Dashboard
            </Link>
            <span>•</span>
            <Link href="/terms-and-conditions" className="text-white">
              Terms of Service
            </Link>
            <span>•</span>
            <Link
              href="/auth/login"
              className="hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Tixolve Inc. All rights reserved.</p>
          <p>
            Designed with absolute visual excellence & accessibility standards.
          </p>
        </div>
      </footer>
    </div>
  );
}
