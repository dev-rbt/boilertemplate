"use client"

import { AlertCircle, Building2, Calendar, Store, Tag, User, Users, Search } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Efr_Branches } from "@/types/tables"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { useUserStore } from '@/stores/users-store';
import { MultiSelect } from "@/components/ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";

interface ComplaintInfoCardProps {
  data: any
  setData: (data: any) => void
  users: Array<{ id: string; name: string }>
}

export function ComplaintInfoCard({
  data,
  setData,
  users,
}: ComplaintInfoCardProps) {
  const [open, setOpen] = useState(false)
  const [assignedUserOpen, setAssignedUserOpen] = useState(false)
  const [observersOpen, setObserversOpen] = useState(false)


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-green-100/50 dark:border-green-900/20 shadow-lg shadow-green-100/30 dark:shadow-green-900/20 rounded-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-900 dark:from-green-400 dark:to-green-200">
              Şikayet Bilgileri
            </h3>
            <p className="text-sm text-green-600/80 dark:text-green-400/80">
              Şikayet durum ve atama bilgileri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div>
            <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Kategori
            </label>
            <Select
              value={data.category}
              onValueChange={(value) => setData({ ...data, category: value })}
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-2 border-green-100 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supply_chain">Tedarik Zinciri</SelectItem>
                <SelectItem value="equipment">Ekipman</SelectItem>
                <SelectItem value="menu">Menü</SelectItem>
                <SelectItem value="staff">Personel</SelectItem>
                <SelectItem value="training">Eğitim</SelectItem>
                <SelectItem value="software">Yazılım</SelectItem>
                <SelectItem value="hardware">Donanım</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div>
            <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Kaynak
            </label>
            <Select
              value={data.source}
              onValueChange={(value) => setData({ ...data, source: value })}
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-2 border-green-100 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                <SelectValue placeholder="Kaynak seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branch_portal">Bayi Portalı</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
                <SelectItem value="phone">Telefon</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="meeting">Toplantı</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Öncelik
            </label>
            <Select
              value={data.priority}
              onValueChange={(value) => setData({ ...data, priority: value })}
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-2 border-green-100 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                <SelectValue placeholder="Öncelik seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Yüksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Düşük</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <Calendar className="h-4 w-4" />
              Durum
            </label>
            <Select
              value={data.status}
              onValueChange={(value) => setData({ ...data, status: value })}
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-2 border-green-100 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/20">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="in_progress">İşlemde</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="resolved">Çözümlendi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <User className="h-4 w-4" />
              Atanan Kişi
            </label>
            <Popover open={assignedUserOpen} onOpenChange={setAssignedUserOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={assignedUserOpen}
                  className="w-full justify-start bg-white/80 dark:bg-gray-800/80 border-2 border-green-100 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                >
                  {data.assignedToName || "Kullanıcı seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl" align="start">
                <Command>
                  <div className="flex items-center p-2 border-b border-border/50">
                    <CommandInput
                      placeholder="Kullanıcı ara..."
                      className="h-9 border-none focus:ring-0"
                    />
                  </div>
                  <CommandEmpty>Kullanıcı bulunamadı</CommandEmpty>
                  <CommandGroup>
                    <CommandList
                      className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-track]:bg-transparent
                      dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                      hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                      dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
                    >
                      {useUserStore.getState().users.map((user) => (
                        <CommandItem
                          key={user.UserID}
                          onSelect={() => {
                            setData(prevData => ({
                              ...prevData,
                              assignedToId: user.UserID.toString(),
                              assignedToName: user.UserName
                            }));
                            setAssignedUserOpen(false);
                          }}
                          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent/50"
                        >
                          <span>{user.UserName}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
              <Users className="h-4 w-4" />
              Gözlemciler
            </label>
            <Popover open={observersOpen} onOpenChange={setObserversOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={observersOpen}
                  className="w-full justify-start bg-white/80 dark:bg-gray-800/80 border-2 border-green-100 dark:border-green-900/30 focus:border-green-500 dark:focus:border-green-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500/20"
                >
                  {data.observers || "Gözlemci seçiniz"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-background/95 backdrop-blur-md border-border/50 shadow-xl" align="start">
                <Command>
                  <div className="flex items-center p-2 border-b border-border/50">
                    <CommandInput
                      placeholder="Kullanıcı ara..."
                      className="h-9 border-none focus:ring-0"
                    />
                  </div>
                  <CommandEmpty>Kullanıcı bulunamadı</CommandEmpty>
                  <CommandGroup>
                    <CommandList
                      className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:w-2
                      [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-track]:bg-transparent
                      dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                      hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                      dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
                    >
                      {useUserStore.getState().users.map((user) => (
                        <CommandItem
                          key={user.UserID}
                          onSelect={() => {
                            const currentIds = data.observers_id ? data.observers_id.split(',') : [];
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

                            setData({
                              ...data,
                              observers_id: newIds.join(','),
                              observers: newNames.join(', ')
                            });
                          }}
                          className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent/50"
                        >
                          <Checkbox
                            checked={data.observers_id ? data.observers_id.split(',').includes(user.UserID.toString()) : false}
                            className="border-border/50"
                          />
                          <span>{user.UserName}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
