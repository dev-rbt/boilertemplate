import { motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import { Bell, CheckCircle2, Ban, Tag, AlertCircle, Clock, RefreshCw, ClipboardCheck, MapPin, CalendarDays } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/types/tables";
import { useCallback, useEffect, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
import axios from "@/lib/axios";

import { SettingsMenu } from "@/app/[tenantId]/(main)/dashboard/components/settings-menu";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useTabStore } from "@/stores/tab-store";

interface NotificationStyle {
    icon: typeof CheckCircle2;
    color: string;
    borderColor: string;
    bgColor: string;
}

interface Settings {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

interface NotificationPanelProps {
    settings: Settings;
    refreshTrigger: number;
}

const DEFAULT_SETTINGS: Settings = {
    minDiscountAmount: 0,
    minCancelAmount: 0,
    minSaleAmount: 0
};

const NOTIFICATION_STYLES: Record<NotificationType, NotificationStyle> = {
    sale: {
        icon: CheckCircle2,
        color: "text-emerald-500",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    discount: {
        icon: Tag,
        color: "text-blue-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    cancel: {
        icon: Ban,
        color: "text-rose-500",
        borderColor: "border-rose-500/30",
        bgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
    alert: {
        icon: AlertCircle,
        color: "text-amber-500",
        borderColor: "border-amber-500/30",
        bgColor: "bg-amber-50 dark:bg-amber-500/10",
    },
};

interface Notification {
    autoId: number;
    branchName: string;
    formName: string;
    orderDateTime: string;
    type: string;
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const localHours = date.getUTCHours().toString().padStart(2, '0');
    const localMinutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${localHours}:${localMinutes}`;
};

export default function NotificationPanel({
    settings,
    refreshTrigger
}: NotificationPanelProps) {
    const { selectedFilter } = useFilterStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [intervalLoading, setIntervalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const { activeTab } = useTabStore();
    const [tempSettings, setTempSettings] = useState<Settings>(settings);

    // Update tempSettings when settings prop changes
    useEffect(() => {
        if (settings && JSON.stringify(tempSettings) !== JSON.stringify(settings)) {
            setTempSettings(settings);
        }
    }, [settings]);

    const fetchNotifications = useCallback(async (isInitial = false) => {
        if (!selectedFilter.branches.length) return;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setIntervalLoading(true);
            }
            setError(null);

            const { data } = await axios.post('/api/notifications', {
                branches: selectedFilter.branches.map(item => item.BranchID),
                ...settings
            });

            setNotifications(Array.isArray(data) ? data : []);
            setHasFetched(true);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
        } finally {
            setLoading(false);
            setIntervalLoading(false);
        }
    }, [selectedFilter.branches, settings]);

    // Initial fetch when settings or branches change
    useEffect(() => {
        if (activeTab === "dashboard" && selectedFilter.branches.length > 0 && settings && !hasFetched) {
            fetchNotifications(true);
        }
    }, [activeTab, selectedFilter.branches, settings, fetchNotifications, hasFetched]);

    // Handle refreshes based on refreshTrigger
    useEffect(() => {
        if (activeTab === "dashboard" && selectedFilter.branches.length > 0 && settings && refreshTrigger > 0) {
            fetchNotifications(false);
        }
    }, [refreshTrigger, activeTab, selectedFilter.branches, settings, fetchNotifications]);

    const renderNotification = useCallback((notification: Notification, index: number, isLastItem: boolean) => {
        const gradients = {
            0: "from-blue-600 to-indigo-600",
            1: "from-indigo-600 to-purple-600",
            2: "from-purple-600 to-pink-600",
            3: "from-pink-600 to-rose-600",
            4: "from-rose-600 to-orange-600",
            5: "from-orange-600 to-amber-600",
        }

        const bgGradients = {
            0: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
            1: "from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40",
            2: "from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40",
            3: "from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40",
            4: "from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40",
            5: "from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40",
        }

        const gradientIndex = index % 6
        const gradient = gradients[gradientIndex as keyof typeof gradients]
        const bgGradient = bgGradients[gradientIndex as keyof typeof bgGradients]

        return (
            <Card
                key={notification.autoId}
                className={cn(
                    "group relative overflow-hidden transition-all duration-300",
                    "hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40",
                    "hover:-translate-y-0.5",
                    "bg-gradient-to-br",
                    bgGradient,
                    "border-0",
                    "mb-4"
                )}
            >


                <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-70"
                        style={{
                            backgroundImage: `linear-gradient(to bottom, var(--${gradient.split(' ')[0]}-color), var(--${gradient.split(' ')[2]}-color))`
                        }} />

                    <div className="pl-3 pr-3 py-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="font-medium text-[13px] text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                            {notification.branchName || 'İsimsiz'}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-sm">{notification.branchName}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide",
                                    "bg-gradient-to-r",
                                    gradient,
                                    "text-white shadow-sm"
                                )}>
                                    {notification.formName}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Avatar className={cn(
                                "w-8 h-8 text-xs relative transition-all duration-300",
                                "group-hover:scale-110",
                                "bg-gradient-to-br shadow-md",
                                gradient,
                                "text-white flex items-center justify-center"
                            )}>
                                <span className="font-medium">
                                    {notification.branchName?.charAt(0).toUpperCase() || 'N/A'}
                                </span>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTime(notification.orderDateTime)}</span>
                                        </div>
                                        <span className="mx-1">•</span>
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" />
                                            <span>{new Date(notification.orderDateTime).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'long'
                                            })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                        <ClipboardCheck className="w-3 h-3" />
                                        <span>{notification.type === "1" ? 'Form Oluşturuldu' : 'Form Güncellendi'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }, [loading]);

    if (loading && !hasFetched) {
        return (
            <div className="flex items-center justify-center h-64">
                <PulseLoader color="#6366f1" size={18} margin={4} speedMultiplier={0.8} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-rose-500">
                <AlertCircle className="h-6 w-6 mr-2" />
                <p>Bildirimler yüklenirken hata oluştu</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <div className="w-full max-w-md mx-auto">
                <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-10 pb-3">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-foreground" />
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
                            </div>
                            <h2 className="text-base font-semibold">Bildirimler</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {(intervalLoading) ? (
                                <motion.div className="flex items-center gap-1">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                    <span className="text-xs text-muted-foreground">Yenileniyor</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-xs text-muted-foreground"
                                >
                                    Canlı
                                </motion.div>
                            )}
                        </div>
                        {/* <SettingsMenu 
                            settings={tempSettings} 
                            onSettingsChange={setTempSettings}
                            onSave={handleSettingsSave}
                            loading={settingsUpdateLoading}
                            isOpen={isSettingsOpen}
                            onOpenChange={setIsSettingsOpen}
                        /> */}
                    </div>

                    <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        Son Yapılan Denetimler
                    </div>
                </div>

                <div className="relative pl-6 pt-4">
                    <div>
                        {notifications.map((notification, index) =>
                            renderNotification(notification, index, index === notifications.length - 1)
                        )}
                    </div>
                </div>
            </div>

            {/* <OrderDetailDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                orderDetail={orderDetail as OrderDetail | null}
                loading={loading}
            /> */}
        </div>
    );
}