"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GovHeader } from "@/components/GovHeader";
import { GovSidebar } from "@/components/GovSidebar";
import { ChevronRight, Home } from "lucide-react";

interface GovLayoutWrapperProps {
  children: React.ReactNode;
}

export const GovLayoutWrapper: React.FC<GovLayoutWrapperProps> = ({
  children,
}) => {
  const pathname = usePathname();

  // Generate breadcrumb items
  const getBreadcrumbs = () => {
    if (pathname === "/" || pathname === "/dashboard") {
      return [{ label: "Executive Overview", href: "/dashboard" }];
    }
    if (pathname === "/submissions/new") {
      return [
        { label: "Institution Submissions", href: "/my-deposits" },
        { label: "New Security Deposit Wizard", href: "/submissions/new" },
      ];
    }
    if (pathname === "/my-deposits") {
      return [
        { label: "Institution Portal", href: "/my-deposits" },
        { label: "Deposit Portfolio", href: "/my-deposits" },
      ];
    }
    if (pathname.startsWith("/scrutiny")) {
      return [
        { label: "Regulation Bureau", href: "/dashboard" },
        { label: "5-Point Scrutiny Workstation", href: "/scrutiny" },
      ];
    }
    if (pathname === "/lifecycle") {
      return [
        { label: "Regulation Bureau", href: "/dashboard" },
        { label: "Maturity & Clause 6.46 Release", href: "/lifecycle" },
      ];
    }
    if (pathname === "/audit") {
      return [
        { label: "Forensic Ledger", href: "/audit" },
        { label: "Cryptographic SHA-256 Audit Trail", href: "/audit" },
      ];
    }
    if (pathname === "/settings") {
      return [
        { label: "Administration", href: "/settings" },
        { label: "APH Rules & System Settings", href: "/settings" },
      ];
    }
    return [{ label: pathname.replace("/", ""), href: pathname }];
  };

  const breadcrumbs = getBreadcrumbs();

  // If viewing bank manager verification link, render clean standalone bank portal
  if (pathname.startsWith("/bank-verify/")) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* 1. Official AICTE & GIGW Top Bar */}
      <GovHeader />

      {/* 2. Middle Body: Left Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <GovSidebar />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between"
        >
          <div>
            {/* Breadcrumb Navigation (GIGW Standard) */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center space-x-1.5 text-xs text-slate-500 mb-5"
            >
              <Link
                href="/dashboard"
                className="hover:text-slate-800 flex items-center space-x-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>

              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.href + idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    className={
                      idx === breadcrumbs.length - 1
                        ? "font-bold text-[#1B365D]"
                        : "hover:text-slate-800"
                    }
                  >
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {/* Dynamic Page Content */}
            {children}
          </div>

          {/* 3. Official GIGW / AICTE Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#1B365D]">VISHWAS-FDR</span>
                <span>•</span>
                <span>All India Council for Technical Education (AICTE)</span>
                <span>•</span>
                <span>Ministry of Education, Government of India</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span>Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070</span>
                <span>•</span>
                <span className="font-semibold text-slate-600">
                  SIH 2026 (PS ID: 26265) Team OG-7
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
