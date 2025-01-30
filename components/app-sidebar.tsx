"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface NavItem {
    title: string;
    icon?: LucideIcons.LucideIcon;
    isActive?: boolean;
    expanded?: boolean;
    url?: string;
    component?: React.ComponentType<any>;
    items?: NavItem[];
    onClick?: () => void;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

    const pathname = usePathname();
    const tenantId = pathname?.split("/")[1] || "";
    const [userData, setUserData] = useState({ name: "", email: "" });
    const navItems = React.useMemo(() => {
        const items = [
            {
                title: "Dashboard",
                icon: LucideIcons.LayoutDashboard,
                isActive: true,
                url: "/dashboard"
            },
            {
                title: "Bayi Başvuru Yönetimi",
                icon: LucideIcons.FileText,
                isActive: true,
                url: "/branchapplication"
            }
        ];
        return items;
    }, []);
    useEffect(() => {
        const storedUserData = localStorage.getItem(`userData_${tenantId}`);
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, [tenantId]);

    const baseData = useMemo(() => ({
        user: {
            name: userData.name,
            email: userData.email,
            avatar: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/avatar.png`,
        },
        teams: [
            {
                name: "robotPOS Enterprise",
                href: `${process.env.PROJECT_BASE_URL || ''}/franchisemanager/${tenantId}`,
                logo: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/Audit.png`,
                plan: "Franchise Manager",
                className: "bg-blue-200",
            },
            {
                name: "robotPOS Enterprise",
                href: "/[tenantId]/(main)/dashboard",
                logo: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/Data.png`,
                plan: "Data Manager",
                className: "bg-blue-200",
            },
            {
                name: "robotPOS Enterprise",
                href: `${process.env.PROJECT_BASE_URL || ''}/operationmanager/${tenantId}`,
                logo: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/Audit.png`,
                plan: "Operation Manager",
                className: "bg-blue-200",
            }
           
            // {
            //     name: "robotPOS Enterprise",
            //     logo: `${process.env.NEXT_PUBLIC_BASEPATH || ''}/images/Franchise.png`,
            //     plan: "Franchise Manager",
            //     className: "bg-blue-200",
            // },
        ],
        projects: [],
    }), [userData]);

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={baseData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <nav className="flex flex-col gap-4">
                    <NavMain items={navItems} />
                </nav>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={baseData.user} />
            </SidebarFooter>
        </Sidebar>
    );
}