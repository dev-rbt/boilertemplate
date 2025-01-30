'use client'

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { useBranchComplaintStore } from "@/stores/branch-complaint-store"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Eye, FileText, Filter, Plus, Search, Star, Store, Tag, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BranchComplaint, getPriorityBadgeVariant, getPriorityLabel, getStatusBadgeVariant, getStatusLabel, priorityOptions, sourceOptions, statusOptions } from "./branch-complaint-types"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, formatDateTime } from "@/lib/utils"
import { ComplaintSourceBadge } from "./components/Branchcomplaint-source"
import { ComplaintCategoryBadge } from "./components/BranchComplaintCategory"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Efr_Branches } from "@/types/tables"

export default function ComplaintsPage() {
    const pathname = usePathname()
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const addTab = useTabStore((state) => state.addTab)
    const setActiveTab = useTabStore(state => state.setActiveTab);
    const tabs = useTabStore(state => state.tabs);
    const isReportsActive = activeTab === 'Bayi Şikayet Yönetimi'
    const [currentFilter, setCurrentFilter] = useState(useTabStore.getState().getTabFilter(activeTab))

    // States
    const { complaints: storeComplaints } = useBranchComplaintStore();
    const [complaints, setComplaints] = useState<BranchComplaint[]>([]);
    const [apiComplaints, setApiComplaints] = useState<BranchComplaint[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [sourceFilter, setSourceFilter] = useState("all")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredBranches, setFilteredBranches] = useState<Efr_Branches[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const requestInProgress = useRef(false)
    const previousRequest = useRef("")

    // Şikayetleri birleştirme fonksiyonu
    const mergeComplaints = useCallback((apiData: BranchComplaint[], storeData: BranchComplaint[]) => {
        console.log('📊 [Merge] Starting merge process');
        console.log('📊 [Merge] API Data count:', apiData.length);
        console.log('📊 [Merge] Store Data count:', storeData.length);

        const mergedMap = new Map<number, BranchComplaint>();

        // Önce API verilerini ekle
        apiData?.forEach(complaint => {
            const numericId = typeof complaint.id === 'string' ? parseInt(complaint.id) : complaint.id;
            console.log(`➕ [Merge] Processing API complaint ID: ${numericId}`);
            mergedMap.set(numericId, complaint);
        });

        // Store verilerini ekle/güncelle (öncelikli)
        storeData?.forEach(complaint => {
            const numericId = typeof complaint.id === 'string' ? parseInt(complaint.id) : complaint.id;
            console.log(`🔄 [Merge] Processing store complaint ID: ${numericId}`);

            // Store'daki veri her zaman API verisini override eder
            if (mergedMap.has(numericId)) {
                console.log(`🔄 [Merge] Updating existing complaint ID: ${numericId}`);
                const existingComplaint = mergedMap.get(numericId);
                mergedMap.set(numericId, { ...existingComplaint, ...complaint });
            } else {
                console.log(`➕ [Merge] Adding new complaint ID: ${numericId}`);
                mergedMap.set(numericId, complaint);
            }
        });

        const result = Array.from(mergedMap.values())
            .sort((a, b) => new Date(b.Created_at).getTime() - new Date(a.Created_at).getTime());

        console.log('📊 [Merge] Final merged count:', result.length);
        return result;
    }, []);

    // Store'daki değişiklikleri dinle
    useEffect(() => {
        console.log('🔄 [Effect] Store or API data changed');
        console.log('🔄 [Effect] Store complaints:', storeComplaints.length);
        console.log('🔄 [Effect] API complaints:', apiComplaints.length);

        const merged = mergeComplaints(apiComplaints, storeComplaints);
        setComplaints(merged);
    }, [storeComplaints, apiComplaints, mergeComplaints]);

    // İlk yükleme ve filtre değişikliklerinde API'den veri çek
    const fetchData = useCallback(async () => {
        if (!isReportsActive || requestInProgress.current) {
            console.log('⏭️ [Fetch] Skipping fetch:', { isReportsActive, requestInProgress: requestInProgress.current });
            return;
        }

        const latestFilter = useTabStore.getState().getTabFilter(activeTab);
        if (!latestFilter) {
            console.log('⚠️ [Fetch] No filter found for active tab');
            return;
        }

        const branches = selectedFilter.selectedBranches.length <= 0
            ? latestFilter.branches
            : selectedFilter.selectedBranches;

        const branchesToUse = branches?.length > 0
            ? branches.map((item: any) => item.BranchID)
            : [1];

        const requestSignature = JSON.stringify({
            branches: branchesToUse,
            date1: latestFilter?.date?.from,
            date2: latestFilter?.date?.to,
        });

        if (requestSignature === previousRequest.current) return;

        requestInProgress.current = true;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/branchcomplaints/branch-complaints-list', {
                branches: branchesToUse,
                date1: latestFilter?.date?.from,
                date2: latestFilter?.date?.to,
            });

            if (response.data) {
                setApiComplaints(response.data);

                // Cache'i güncelle
                useTabStore.getState().setTabFilter(activeTab, {
                    ...latestFilter,
                    cachedData: response.data
                });
            }

            previousRequest.current = requestSignature;
        } catch (err) {
            console.error('API request failed:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
            requestInProgress.current = false;
        }
    }, [isReportsActive, activeTab, selectedFilter]);

    useEffect(() => {
        if (!isReportsActive) return;

        const loadData = async () => {
            const latestFilter = useTabStore.getState().getTabFilter(activeTab);
            if (!latestFilter) return;

            // Önce cache'den veri yükle
            if (latestFilter.cachedData) {
                setApiComplaints(latestFilter.cachedData);
            }

            // Sonra API'den güncel veriyi al
            await fetchData();
        };

        loadData();
    }, [isReportsActive, activeTab, fetchData, selectedFilter.appliedAt]);

    const handleOpenEdit = useCallback((complaintId: number, complaint: BranchComplaint) => {
        const tabId = `Bayi Şikayet #${complaint.id}  - ${complaint.Title}`;
        const existingTab = tabs.find(tab => tab.id === tabId);

        if (existingTab) {
            setActiveTab(tabId);
        } else {
            const currentFilter = useTabStore.getState().getTabFilter(activeTab);
            const branches = selectedFilter.selectedBranches.length <= 0
                ? currentFilter?.branches || []
                : selectedFilter.selectedBranches;

            fetch(`/api/branchcomplaints/branch-complaints-detail?id=${complaintId}`)
                .then(res => res.json())
                .then(data => {
                    addTab({
                        id: tabId,
                        title: `Bayi Şikayet #${complaint.id}  - ${complaint.Title}`,
                        lazyComponent: () => import("./components/BranchUpdateComplaint").then(module => ({
                            default: (props: any) => {
                                return <module.default
                                    complaint={data.complaint}
                                    complaintId={complaintId}
                                    complaintcomments={data.comments}
                                    attachments={data.attachments}
                                    filteredBranches={branches}
                                    selectedBranch={selectedBranch}
                                    onBranchChange={handleBranchChange}
                                />;
                            }
                        }))
                    });
                    setActiveTab(tabId);
                })
                .catch(error => {
                    console.error('Şikayet detayları alınırken hata:', error);
                    toast({
                        title: 'Hata',
                        description: 'Şikayet detayları alınamadı',
                        variant: 'destructive'
                    });
                });
        }
    }, [addTab, setActiveTab, tabs, selectedFilter, activeTab, selectedBranch]);

    const handleNewComplaint = useCallback(() => {
        const tabId = `Yeni Bayi Şikayet`;
        const currentFilter = useTabStore.getState().getTabFilter(activeTab);
        const branches = selectedFilter.selectedBranches.length <= 0
            ? currentFilter?.branches || []
            : selectedFilter.selectedBranches;

        addTab({
            id: tabId,
            title: "Yeni Bayi Şikayet",
            lazyComponent: () => import("./components/BranchCreateComplaint").then(module => ({
                default: () => {
                    return <module.default
                        filteredBranches={branches}
                        selectedBranch={selectedBranch}
                        onBranchChange={handleBranchChange}
                    />;
                }
            }))
        });
        setActiveTab(tabId);
    }, [addTab, setActiveTab, selectedFilter, activeTab, selectedBranch]);

    const handleBranchChange = (branchId: string) => {
        setSelectedBranch(branchId);
    };

    useEffect(() => {
        if (selectedFilter?.branches) {
            setFilteredBranches(
                searchQuery.trim() === ''
                    ? selectedFilter.branches
                    : selectedFilter.branches.filter(branch =>
                        branch.BranchName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
            );
        }
    }, [searchQuery, selectedFilter?.branches]);

    // Filter complaints
    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            (complaint.Title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (complaint.BranchName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (complaint.CustomerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (complaint.Description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || complaint.Status === statusFilter;
        const matchesPriority = priorityFilter === "all" || complaint.Priority === priorityFilter;
        const matchesSource = sourceFilter === "all" || complaint.Source === sourceFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesSource;
    });

    const totalComplaints = filteredComplaints.length;
    const totalPages = Math.ceil(totalComplaints / itemsPerPage);
    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1))
    }

    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Bayi Şikayet Yönetimi
                        </h2>
                        <p className="text-[0.925rem] text-muted-foreground">
                            Bayi şikayetlerini yönetin ve takip edin
                        </p>
                    </div>
                    <Button
                        onClick={handleNewComplaint}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Bayi Şikayet
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
                                            placeholder="Şikayet ara..."
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

                                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                        <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4" />
                                                <SelectValue placeholder="Kaynak Filtrele" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sourceOptions.map((option) => (
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
                                                Şikayet Başlığı
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
                                        <TableHead className="w-[15%]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                </span>
                                                Kategori
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
                                    ) : (
                                        paginatedComplaints.map((complaint, index) => (
                                            <TableRow
                                                key={complaint.id}
                                                className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                                onClick={() => handleOpenEdit(complaint.id, complaint)}
                                            >
                                                <TableCell>
                                                    <div className="font-medium text-start">#{complaint.id}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{complaint.Title}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-[300px]">
                                                    <ComplaintSourceBadge source={complaint.Source} />

                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{complaint.BranchName}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-[300px]">
                                                        {complaint.CustomerName}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-start gap-1.5">
                                                    <ComplaintCategoryBadge category={complaint.Category} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={getStatusBadgeVariant(complaint.Status)}
                                                        className={cn(
                                                            "inline-flex items-center justify-center w-24",
                                                            complaint.Status === "open" && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                                                            complaint.Status === "in_progress" && "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
                                                            complaint.Status === "pending" && "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
                                                            complaint.Status === "resolved" && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                                        )}
                                                    >
                                                        {getStatusLabel(complaint.Status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={getPriorityBadgeVariant(complaint.Priority)}
                                                        className={cn(
                                                            "inline-flex items-center justify-center w-20",
                                                            complaint.Priority === "high" && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                                                            complaint.Priority === "medium" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                                                            complaint.Priority === "low" && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                                        )}
                                                    >
                                                        {getPriorityLabel(complaint.Priority)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatDateTime(complaint.Created_at)}
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
                                        Toplam {totalComplaints} kayıt
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreviousPage()}
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
                                        onClick={() => handleNextPage()}
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
        </>
    );
}