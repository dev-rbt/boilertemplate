
'use client'

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { useBranchApplicationStore } from "@/stores/branch-application-store"
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Eye, FileText, Filter, Plus, Search, Star, Store, Tag, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn, formatDateTime } from "@/lib/utils"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CreateApplication from "./components/BranchCreateApplication"

export default function ApplicationsPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const { applications: storeApplications } = useBranchApplicationStore();
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [applications, setApplications] = useState([])
    const [apiApplications, setApiApplications] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const statusOptions = [
        { value: "all", label: "Tüm Durumlar" },
        { value: "pending", label: "Beklemede" },
        { value: "approved", label: "Onaylandı" },
        { value: "rejected", label: "Reddedildi" }
    ]

    const priorityOptions = [
        { value: "all", label: "Tüm Öncelikler" },
        { value: "high", label: "Yüksek" },
        { value: "medium", label: "Orta" },
        { value: "low", label: "Düşük" }
    ]

    const filteredApplications = applications.filter(application => {
        const matchesSearch =
            (application?.Title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (application?.BranchName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || application?.Status === statusFilter;
        const matchesPriority = priorityFilter === "all" || application?.Priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const totalApplications = filteredApplications.length;
    const totalPages = Math.ceil(totalApplications / itemsPerPage);
    const paginatedApplications = filteredApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
    }

    if (showCreateForm) {
        return <CreateApplication filteredBranches={selectedFilter.branches} />
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Bayi Başvuru Yönetimi
                    </h2>
                    <p className="text-[0.925rem] text-muted-foreground">
                        Bayi başvurularını yönetin ve takip edin
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => setShowCreateForm(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Bayi Başvurusu
                </Button>
            </div>

            {/*search and filter*/}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-2 border-blue-100/50 dark:border-blue-900/20 shadow-lg shadow-blue-500/5">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                    <Input
                                        placeholder="Başvuru ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            <SelectValue placeholder="Durum Filtrele" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            <SelectValue placeholder="Öncelik Filtrele" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="border-0 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex-1 overflow-hidden rounded-xl">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                    <div className="flex-1 overflow-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                        <Table className="relative w-full">
                            <TableHeader className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="w-[5%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </span>
                                            ID
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[20%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </span>
                                            Başvuru Başlığı
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                <Store className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </span>
                                            Şube
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </span>
                                            Durum
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                                                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            </span>
                                            Öncelik
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                            </span>
                                            Tarih
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                                <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </span>
                                            İşlemler
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedApplications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4">
                                            Henüz başvuru bulunmamaktadır.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedApplications.map((application, index) => (
                                        <TableRow
                                            key={application.id}
                                            className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                        >
                                            <TableCell>
                                                <div className="font-medium text-start">#{application.id}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{application.Title}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{application.BranchName}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "inline-flex items-center justify-center w-24",
                                                        application.Status === "pending" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                                                        application.Status === "approved" && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                                                        application.Status === "rejected" && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                                    )}
                                                >
                                                    {application.Status === "pending" && "Beklemede"}
                                                    {application.Status === "approved" && "Onaylandı"}
                                                    {application.Status === "rejected" && "Reddedildi"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "inline-flex items-center justify-center w-20",
                                                        application.Priority === "high" && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                                                        application.Priority === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                                                        application.Priority === "low" && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                                    )}
                                                >
                                                    {application.Priority === "high" && "Yüksek"}
                                                    {application.Priority === "medium" && "Orta"}
                                                    {application.Priority === "low" && "Düşük"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDateTime(application.Created_at)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 justify-self-center" />
                                                        </TooltipTrigger>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="py-1.5 px-6 bg-white/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    Toplam {totalApplications} kayıt
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="h-8 px-4"
                                >
                                    Önceki
                                </Button>
                                <div className="flex items-center gap-2 min-w-[5rem] justify-center">
                                    <span className="font-medium">{currentPage}</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-muted-foreground">{totalPages}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-8 px-4"
                                >
                                    Sonraki
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
