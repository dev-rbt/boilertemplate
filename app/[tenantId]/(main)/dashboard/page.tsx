"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useFilterStore } from "@/stores/filters-store";
import { useSettingsStore } from "@/stores/settings-store";
import PulseLoader from "react-spinners/PulseLoader";
import { useTabStore } from "@/stores/tab-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Bell, Store, PieChart, ArrowRight, ClipboardCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserStore } from "@/stores/users-store";
import { WebWidget } from "@/types/tables";

import NotificationPanel from "@/app/[tenantId]/(main)/dashboard/components/NotificationPanel";
import WidgetCard from "@/app/[tenantId]/(main)/dashboard/components/WidgetCard";
import { ChartCard } from "@/app/[tenantId]/(main)/dashboard/components/chart-card";
import { FormDistributionCard } from "@/app/[tenantId]/(main)/dashboard/components/form-distribution-card";
import { RecentInspections } from "@/app/[tenantId]/(main)/dashboard/components/recent-inspections";
const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Settings {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

const DEFAULT_SETTINGS: Settings = {
    minDiscountAmount: 0,
    minCancelAmount: 0,
    minSaleAmount: 0
};

export default function Dashboard() {
    const { activeTab } = useTabStore();
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { settings } = useSettingsStore();
    const { selectedFilter } = useFilterStore();
    const { fetchUsers } = useUserStore();
    const [widgets, setWidgets] = useState<WebWidget[]>([]);

    useEffect(() => {
        if (selectedFilter.branches) {
            setSelectedBranches(selectedFilter.branches.map(item => item.BranchID));
        }
    }, [selectedFilter]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (activeTab === "dashboard") {
            const fetchWidgetsData = async () => {
                try {
                    const response = await axios.get<WebWidget[]>("/api/webwidgets", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    setWidgets(response.data);
                } catch (error) {
                    console.error("Error fetching initial data:", error);
                }
            };

            fetchWidgetsData();

            const countdownInterval = setInterval(() => {
                setCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        setRefreshTrigger(prev => prev + 1);
                        return REFRESH_INTERVAL / 1000;
                    }
                    return prevCount - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "dashboard") {
            const fetchData = async () => {
                try {
                    const response = await axios.get<WebWidget[]>("/api/webwidgets", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    setWidgets(response.data);
                } catch (error) {
                    console.error("Error refreshing data:", error);
                }
            };

            if (refreshTrigger > 0) {
                fetchData();
            }
        }
    }, [refreshTrigger, activeTab]);

    return (
        <div className="h-full flex">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                <div className="flex justify-between items-center py-3 px-3 bg-background/95 backdrop-blur-sm border-b border-border/60 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Özet Bilgiler
                    </h2>
                    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground text-start flex items-center gap-2 group">
                        <div className="duration-[8000ms] text-blue-500 group-hover:text-blue-600 [animation:spin_6s_linear_infinite]">
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 22h14" />
                                <path d="M5 2h14" />
                                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                            </svg>
                        </div>
                        <span className="font-medium w-4 text-center">{countdown}</span>
                        <span>saniye</span>
                    </div>
                </div>

                <div className="p-3 space-y-4 md:space-y-6 pb-20">
                    {widgets.length <= 0 || widgets === null || widgets === undefined ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <PulseLoader color="#6366f1" size={18} margin={4} speedMultiplier={0.8} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 auto-rows-auto">
                            {widgets.map((widget, index) => (
                                <WidgetCard reportId={widget.ReportID} key={widget.AutoID} reportName={widget.ReportName}
                                    reportIcon={widget.ReportIcon}
                                    {...widget}
                                    columnIndex={index % 3} />
                            ))}
                        </div>
                    )}

                    {widgets.length > 0 && (
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold text-foreground py-3 flex items-center gap-2 border-b border-border/60">
                                <PieChart className="h-5 w-5" />
                                Grafikler
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <div className="col-span-4">
                                    {selectedBranches.length > 0 ? (
                                        <ChartCard
                                            key={refreshTrigger} // Key ekleyerek component'in yeniden render olmasını sağlıyoruz
                                            branches={selectedBranches}
                                            date={selectedFilter.date.from?.toISOString().split('T')[0] || ''}
                                            refreshTrigger={refreshTrigger}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                            Lütfen şube seçiniz
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <FormDistributionCard
                                        key={refreshTrigger} // Key ekleyerek component'in yeniden render olmasını sağlıyoruz
                                        branches={selectedBranches}
                                        date={selectedFilter.date.from?.toISOString().split('T')[0] || ''}
                                        refreshTrigger={refreshTrigger}
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold text-foreground py-3 flex items-center gap-2 border-b border-border/60">
                                <Store className="h-5 w-5" />
                                Son Denetimler
                            </h2>
                            <div className="rounded-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50 shadow-xl shadow-gray-200/40 dark:shadow-gray-900/40 border border-gray-200/60 dark:border-gray-800/60">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                                                <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                                                    Denetim Geçmişi Listesi
                                                </h3>
                                                <p className="text-[0.925rem] text-muted-foreground">
                                                    Son yapılan denetimler ve sonuçları
                                                </p>
                                            </div>
                                        </div>
                                        <Link href="/reports">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="group transition-all duration-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                                            >
                                                <span className="text-sm mr-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                    Tümünü Gör
                                                </span>
                                                <ArrowRight className="h-4 w-4 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="col-span-7">
                                        <RecentInspections
                                            key={refreshTrigger} // Key ekleyerek component'in yeniden render olmasını sağlıyoruz
                                            branches={selectedBranches}
                                            refreshTrigger={refreshTrigger}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="hidden lg:block w-[300px] border-l border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="h-full p-3 overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                    <NotificationPanel
                        settings={settings}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-4 lg:hidden z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="rounded-full h-12 w-12">
                            <div className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-[90%] max-w-[400px] p-0 sm:w-[400px]"
                    >
                        <NotificationPanel
                            settings={settings}
                            refreshTrigger={refreshTrigger}
                        />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
