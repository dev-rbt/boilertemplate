"use client"

import { useState, useEffect } from "react"
import { Store, Tag, Calendar, FileText, User, Users, Building2, Mail, MessageSquare, Search, Check, AlertCircle, FileText as FileTextIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BranchComplaint, ComplaintCategory, complaintCategoryMap, getPriorityBadgeVariant, getPriorityLabel } from "../../branch-complaint-types"
import { ComplaintSourceBadge } from "../Branchcomplaint-source"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Efr_Branches } from "@/types/tables"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { ComplaintSource, complaintSourceMap } from "../../branch-complaint-types"
import { useUserStore } from '@/stores/users-store';
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ComplaintCategoryBadge } from "../BranchComplaintCategory"

interface ComplaintDetailCardProps {
  complaint: BranchComplaint;
  filteredBranches?: Efr_Branches[];
  branchPopoverOpen?: boolean;
  setBranchPopoverOpen?: (open: boolean) => void;
  formatDate?: (date: string) => string;
  selectedBranch?: string;
  onBranchChange?: (branchId: string) => void;
  isEditMode?: boolean;
  form?: any;
  users?: Array<{ id: number; name: string }>;
}

export function ComplaintDetailCard({
  complaint,
  filteredBranches,
  formatDate,
  branchPopoverOpen,
  setBranchPopoverOpen,
  selectedBranch,
  onBranchChange,
  isEditMode = false,
  form,
  users = [],
}: ComplaintDetailCardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [localFormData, setLocalFormData] = useState({
    branchId: complaint?.BranchID?.toString() || "",
    priority: complaint?.Priority || "medium",
    source: complaint?.Source || "website",
    assignedToId: complaint?.Assigned_to_id?.toString() || "",
    assignedToName: complaint?.Assigned_to_Name || "",
    customerName: complaint?.CustomerName || "",
    customerContact: complaint?.CustomerContact || "",
    observers_id: complaint?.Observers_id || "",
    observers: complaint?.Observers || "",
    category: complaint?.Category || "",
  });
  const [assignedToOpen, setAssignedToOpen] = useState(false);
  const [observersOpen, setObserversOpen] = useState(false);

  useEffect(() => {
    if (complaint) {
      setLocalFormData({
        branchId: complaint.BranchID?.toString() || "",
        priority: complaint.Priority || "medium",
        source: complaint.Source || "website",
        assignedToId: complaint.Assigned_to_id?.toString() || "",
        assignedToName: complaint.Assigned_to_Name || "",
        customerName: complaint.CustomerName || "",
        customerContact: complaint.CustomerContact || "",
        observers_id: complaint.Observers_id || "",
        observers: complaint.Observers || "",
        category: complaint.Category || "",
      });
    }
  }, [complaint]);

  const handleBranchSelect = (branch: Efr_Branches) => {
    setLocalFormData(prev => ({
      ...prev,
      branchId: branch.BranchID.toString()
    }));

    if (form) {
      form.setValue("branchId", branch.BranchID.toString());
    }

    if (onBranchChange) {
      onBranchChange(branch.BranchID.toString());
    }

    if (setBranchPopoverOpen) {
      setBranchPopoverOpen(false);
    }
  };

  const handlePriorityChange = (value: string) => {
    setLocalFormData(prev => ({
      ...prev,
      priority: value
    }));

    if (form) {
      form.setValue("priority", value);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          {/* Branch Section */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Label htmlFor="branch" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Şube
            </Label>
            <Popover open={branchPopoverOpen} onOpenChange={setBranchPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={branchPopoverOpen}
                  className={`w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 ${!isEditMode && 'opacity-75 cursor-not-allowed'}`}
                  disabled={!isEditMode}
                >
                  {localFormData.branchId ? (
                    <span className="flex items-center font-medium">
                      {filteredBranches?.find(b => b.BranchID.toString() === localFormData.branchId)?.BranchName || "Şube seçiniz"}
                    </span>
                  ) : (
                    <span className="text-gray-400">Şube seçiniz</span>
                  )}
                  <Search className="ml-2 h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command className="border-none">
                  <CommandInput
                    placeholder="Şube ara..."
                    className="border-none focus:ring-0 py-3"
                  />
                  <CommandList>
                    <CommandEmpty className="py-4 text-sm text-gray-500">Şube bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {filteredBranches?.map((branch) => (
                          <CommandItem
                            key={branch.BranchID}
                            value={branch.BranchName}
                            onSelect={() => handleBranchSelect(branch)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex flex-col">
                              <p className="font-medium text-gray-700 dark:text-gray-200">
                                {branch.BranchName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {branch.CustomField6 && `${branch.CustomField6} - `}
                                {branch.CustomField7}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority Section */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Öncelik
            </span>
            <div>
              {isEditMode ? (
                <Select
                  value={localFormData.priority}
                  onValueChange={handlePriorityChange}
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {localFormData.priority === "high" && <div className="w-2 h-2 rounded-full bg-red-500" />}
                        {localFormData.priority === "medium" && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                        {localFormData.priority === "low" && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        {getPriorityLabel(localFormData.priority)}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Düşük
                    </SelectItem>
                    <SelectItem value="medium" className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Orta
                    </SelectItem>
                    <SelectItem value="high" className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Yüksek
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium ${localFormData.priority === 'high' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    localFormData.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${localFormData.priority === 'high' ? 'bg-red-500' :
                      localFormData.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                    }`} />
                  {getPriorityLabel(localFormData.priority)}
                </div>
              )}
            </div>
          </div>

          {/* Creation Date */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Oluşturulma
            </span>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {formatDate ? formatDate(complaint?.Created_at || "") : complaint?.Created_at}
              </p>
            </div>
          </div>

          {/* Assigned User */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Atanan Kişi
            </span>
            <div>
              {isEditMode ? (
                <Popover open={assignedToOpen} onOpenChange={setAssignedToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-start bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    >
                      {localFormData.assignedToName || "Kullanıcı seçiniz"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Kullanıcı ara..." className="border-none focus:ring-0 py-3" />
                      <CommandList>
                        <CommandEmpty className="py-4 text-sm text-gray-500">Kullanıcı bulunamadı</CommandEmpty>
                        <CommandGroup>
                          {useUserStore.getState().users.map((user) => (
                            <CommandItem
                              key={user.UserID}
                              onSelect={() => {
                                setLocalFormData(prev => ({
                                  ...prev,
                                  assignedToId: user.UserID.toString(),
                                  assignedToName: user.UserName
                                }));
                                if (form) {
                                  form.setValue("assignedToId", user.UserID.toString());
                                  form.setValue("assignedToName", user.UserName);
                                }
                                setAssignedToOpen(false);
                              }}
                              className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                {user.UserName}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {localFormData.assignedToName || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observers */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Gözlemciler
            </span>
            <div>
              {isEditMode ? (
                <Popover open={observersOpen} onOpenChange={setObserversOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-start bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    >
                      {localFormData.observers || "Gözlemci seçiniz"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Kullanıcı ara..." className="border-none focus:ring-0 py-3" />
                      <CommandList>
                        <CommandEmpty className="py-4 text-sm text-gray-500">Kullanıcı bulunamadı</CommandEmpty>
                        <CommandGroup>
                          {useUserStore.getState().users.map((user) => (
                            <CommandItem
                              key={user.UserID}
                              onSelect={() => {
                                const currentIds = localFormData.observers_id ? localFormData.observers_id.split(',').filter(Boolean) : [];
                                const userId = user.UserID.toString();
                                let newIds: string[];
                                let newNames: string[];

                                if (currentIds.includes(userId)) {
                                  newIds = currentIds.filter(id => id !== userId);
                                  newNames = useUserStore.getState().users
                                    .filter(u => newIds.includes(u.UserID.toString()))
                                    .map(u => u.UserName);
                                } else {
                                  newIds = [...currentIds, userId];
                                  newNames = useUserStore.getState().users
                                    .filter(u => newIds.includes(u.UserID.toString()))
                                    .map(u => u.UserName);
                                }

                                const newObserversId = newIds.join(',');
                                const newObservers = newNames.join(', ');

                                setLocalFormData(prev => ({
                                  ...prev,
                                  observers_id: newObserversId,
                                  observers: newObservers
                                }));

                                if (form) {
                                  form.setValue("observers_id", newObserversId);
                                  form.setValue("observers", newObservers);
                                }
                              }}
                              className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={localFormData.observers_id ? localFormData.observers_id.split(',').filter(Boolean).includes(user.UserID.toString()) : false}
                                  className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <span>{user.UserName}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {localFormData.observers || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>



          {/* Last Action */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <FileTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Son İşlem
            </span>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {formatDate ? formatDate(complaint?.Last_action_at || "") : complaint?.Last_action_at}
              </p>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Şube Müdürü
            </span>
            <div>
              {isEditMode ? (
                <Input
                  value={localFormData.customerName}
                  onChange={(e) => {
                    setLocalFormData(prev => ({ ...prev, customerName: e.target.value }));
                    if (form) form.setValue("customerName", e.target.value);
                  }}
                  placeholder="Şube Müdürü adını giriniz"
                  disabled={!isEditMode}
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {localFormData.customerName || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Contact */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Şube Müdürü İletişim
            </span>
            <div>
              {isEditMode ? (
                <Input
                  value={localFormData.customerContact}
                  onChange={(e) => {
                    setLocalFormData(prev => ({ ...prev, customerContact: e.target.value }));
                    if (form) form.setValue("customerContact", e.target.value);
                  }}
                  placeholder="İletişim bilgisi giriniz"
                  disabled={!isEditMode}
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {localFormData.customerContact || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Kaynak
            </span>
            <div>
              {isEditMode ? (
                <Select
                  value={localFormData.source}
                  onValueChange={(value) => {
                    setLocalFormData(prev => ({ ...prev, source: value }));
                    if (form) form.setValue("source", value);
                  }}
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <SelectValue>
                      {localFormData.source ? complaintSourceMap[localFormData.source as ComplaintSource] : "Kaynak seçiniz"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(complaintSourceMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <ComplaintSourceBadge source={localFormData.source as ComplaintSource} />
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              Kategori
            </span>
            <div>
              {isEditMode ? (
                <Select
                  value={localFormData.category}
                  onValueChange={(value) => {
                    setLocalFormData(prev => ({ ...prev, category: value }));
                    if (form) form.setValue("category", value);
                  }}
                  disabled={!isEditMode}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <SelectValue>
                      {localFormData.category ? complaintCategoryMap[localFormData.category as ComplaintCategory] : "Kategori seçiniz"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(complaintCategoryMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <ComplaintCategoryBadge category={localFormData.category} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
