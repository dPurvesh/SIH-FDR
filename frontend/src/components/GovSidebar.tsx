"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  FilePlus,
  FolderLock,
  SearchCheck,
  CalendarClock,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Award,
} from "lucide-react";

export const GovSidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    currentRole,
    dashboardData,
  } = useApp();

  const flaggedCount = dashboardData?.kpis?.flagged_tampered_cases || 0;
  const overdueCount = dashboardData?.kpis?.overdue_count || 0;
  const expiringCount = dashboardData?.kpis?.expiring_soon_count || 0;
  const totalFdrs = dashboardData?.kpis?.total_fdrs || 0;

  const navItems = [
    {
      title: "Executive Overview",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      badge: `${totalFdrs}`,
      badgeColor: "bg-slate-200 text-slate-700",
    },
    {
      title: "Submit New FDR",
      href: "/submissions/new",
      icon: <FilePlus className="w-4 h-4 shrink-0" />,
      roleLimit: ["INSTITUTION", "MAKER"],
      highlight: true,
    },
    {
      title: "My Deposit Portfolio",
      href: "/my-deposits",
      icon: <FolderLock className="w-4 h-4 shrink-0" />,
      roleLimit: ["INSTITUTION"],
    },
    {
      title: "Scrutiny Workstation",
      href: "/scrutiny",
      icon: <SearchCheck className="w-4 h-4 shrink-0" />,
      badge: flaggedCount > 0 ? `${flaggedCount} Flagged` : undefined,
      badgeColor: "bg-red-100 text-red-700 font-bold",
    },
    {
      title: "Maturity & Clause 6.46",
      href: "/lifecycle",
      icon: <CalendarClock className="w-4 h-4 shrink-0" />,
      badge:
        overdueCount + expiringCount > 0
          ? `${overdueCount + expiringCount} Action`
          : undefined,
      badgeColor: "bg-amber-100 text-amber-800 font-bold",
    },
    {
      title: "Forensic Audit & Reports",
      href: "/audit",
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      badge: "WORM",
      badgeColor: "bg-emerald-100 text-emerald-800 font-bold font-mono",
    },
    {
      title: "APH Rules & Settings",
      href: "/settings",
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between transition-all duration-200 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Navigation Links */}
      <div className="p-3">
        {/* Section Header */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1B365D] text-white shadow-xs"
                    : item.highlight
                    ? "bg-amber-50/70 text-amber-900 border border-amber-200/80 hover:bg-amber-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <span
                    className={
                      isActive
                        ? "text-amber-400"
                        : item.highlight
                        ? "text-amber-600"
                        : "text-slate-500"
                    }
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.2 rounded text-[10px] ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Guidelines Link & Sidebar Toggle */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        {!sidebarCollapsed && (
          <div className="p-2.5 bg-white rounded-lg border border-slate-200 mb-2.5 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 block text-[10px] uppercase">
              Regulatory Framework
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              AICTE Approval Process Handbook (APH) 2024–27 Clause 6.46
            </span>
            <a
              href="https://aicte.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-[#1B365D] font-bold text-[10px] flex items-center space-x-1 mt-1 hover:underline"
            >
              <span>aicte.gov.in</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

