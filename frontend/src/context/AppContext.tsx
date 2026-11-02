"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  RoleType,
  DashboardResponse,
  FDRItem,
  VerificationResult,
} from "@/types";
import { NotificationItem, EscalationItem } from "@/components/NotificationsDrawer";

interface AppContextType {
  currentRole: RoleType;
  setCurrentRole: (role: RoleType) => void;
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  fontScale: "normal" | "large" | "larger";
  setFontScale: (scale: "normal" | "large" | "larger") => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  dashboardData: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  handleDateChange: (daysOffset: number) => Promise<any>;
  notifications: NotificationItem[];
  escalations: EscalationItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentRole, setCurrentRole] = useState<RoleType>("MAKER");
  const [simulatedDate, setSimulatedDate] = useState<string>("2026-11-01");
  const [fontScale, setFontScale] = useState<"normal" | "large" | "larger">(
    "normal"
  );
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [escalations, setEscalations] = useState<EscalationItem[]>([]);

  // Apply font scale to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      "font-scale-normal",
      "font-scale-large",
      "font-scale-larger"
    );
    root.classList.add(`font-scale-${fontScale}`);
  }, [fontScale]);

  // Apply high contrast to <body>
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [highContrast]);

  // Fetch Dashboard
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
      }
      const data: DashboardResponse = await res.json();
      setDashboardData(data);
      if (data.simulated_date) {
        setSimulatedDate(data.simulated_date);
      }
      setError(null);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  // Time Machine Simulator
  const handleDateChange = async (daysOffset: number) => {
    try {
      const res = await fetch("/api/simulation/set-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days_offset: daysOffset }),
      });
      if (!res.ok) {
        throw new Error("Failed to update simulation date");
      }
      const data = await res.json();
      setSimulatedDate(data.new_date);
      if (data.notifications) {
        setNotifications(data.notifications);
      }
      if (data.escalations) {
        setEscalations(data.escalations);
      }
      await refreshDashboard();
      return data;
    } catch (err) {
      console.error("Simulation date update failed", err);
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        simulatedDate,
        setSimulatedDate,
        fontScale,
        setFontScale,
        highContrast,
        setHighContrast,
        language,
        setLanguage,
        isSimulatorOpen,
        setIsSimulatorOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        dashboardData,
        loading,
        error,
        refreshDashboard,
        handleDateChange,
        notifications,
        escalations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

