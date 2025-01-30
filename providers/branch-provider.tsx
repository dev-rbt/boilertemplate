"use client";

import { createContext, useContext, useEffect } from "react";
import axios from "@/lib/axios";

import { Efr_Branches } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";

const BranchContext = createContext<{
    refetchBranches: () => Promise<void>;
}>({
    refetchBranches: async () => {},
});

export const useBranchContext = () => useContext(BranchContext);

export function BranchProvider({ children }: { children: React.ReactNode }) {
    const { setBranchs } = useFilterStore();

    const fetchBranches = async () => {
        try {
            const response = await axios.get<Efr_Branches[]>("/api/efr_branches", {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setBranchs(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    return (
        <BranchContext.Provider value={{ refetchBranches: fetchBranches }}>
            {children}
        </BranchContext.Provider>
    );
}
