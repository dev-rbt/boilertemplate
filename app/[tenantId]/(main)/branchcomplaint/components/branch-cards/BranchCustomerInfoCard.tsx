"use client"

import { User, Phone, Store, Building2, Search } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Efr_Branches } from "@/types/tables"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CustomerInfoCardProps {
  data: any
  setData: (data: any) => void
  branches: Efr_Branches[]
  onBranchSelect?: (branch: any) => void
}

export function CustomerInfoCard({ data, setData, branches, onBranchSelect }: CustomerInfoCardProps) {
  const [open, setOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [assignedUserOpen, setAssignedUserOpen] = useState(false)
  const [observersOpen, setObserversOpen] = useState(false)

  const handleBranchSelect = (branch: any) => {
    if (onBranchSelect) {
      onBranchSelect(branch);
    }
    setData(prev => ({
      ...prev,
      branchId: branch.BranchID.toString(),
      branchName: branch.BranchName
    }));
    setSelectedBranch(branch);
    setOpen(false); // Popover'ı kapat
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-purple-100/50 dark:border-purple-900/20 shadow-lg shadow-purple-100/30 dark:shadow-purple-900/20 rounded-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
            <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-200">
              Şube Bilgileri
            </h3>
            <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
              Şube ve Şube Müdürü Bilgileri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <label className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium mb-2">
              <Store className="h-4 w-4" />
              Şube
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    "bg-white/80 dark:bg-gray-800/80 border-2 border-purple-100 dark:border-purple-900/30",
                    "focus:border-purple-500 dark:focus:border-purple-400 rounded-xl",
                    "transition-all duration-200 focus:ring-2 focus:ring-purple-500/20",
                    !data.branchId && "text-muted-foreground"
                  )}
                >
                  {data.branchId ? (
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-purple-700" />
                      {branches?.find(b => b.BranchID.toString() === data.branchId)?.BranchName || "Şube seçiniz"}
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      Şube seçiniz
                    </span>
                  )}
                  <Search className="ml-2 h-4 w-4 text-slate-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Şube ara..." />
                  <CommandList>
                    <CommandEmpty>Şube bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[200px]">
                        {(branches || []).map((branch) => (
                          <CommandItem
                            key={branch.BranchID}
                            value={branch.BranchName}
                            onSelect={() => handleBranchSelect(branch)}
                            className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 py-3"
                          >
                            <div className="flex flex-col">
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {branch.BranchName}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
          <div>
            <label className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium mb-2">
              <User className="h-4 w-4" />
              Şube Müdürü Adı
            </label>
            <Input
              value={data.customerName}
              onChange={(e) => setData({ ...data, customerName: e.target.value })}
              placeholder="Şube Müdürü Adı"
              className="bg-white/80 dark:bg-gray-800/80 border-2 border-purple-100 dark:border-purple-900/30 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium mb-2">
              <Phone className="h-4 w-4" />
              Şube Müdürü İletişim
            </label>
            <Input
              value={data.customerContact}
              onChange={(e) => setData({ ...data, customerContact: e.target.value })}
              placeholder="E-posta veya telefon"
              className="bg-white/80 dark:bg-gray-800/80 border-2 border-purple-100 dark:border-purple-900/30 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
