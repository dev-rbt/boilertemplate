"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface ComplaintDescriptionCardProps {
    description: string;
    isEditMode?: boolean;
    form?: any;
}

export function ComplaintDescriptionCard({
    description,
    isEditMode = false,
    form
}: ComplaintDescriptionCardProps) {
    const [localDescription, setLocalDescription] = useState(description);

    useEffect(() => {
        setLocalDescription(description);
    }, [description]);

    const handleDescriptionChange = (value: string) => {
        setLocalDescription(value);
        if (form) {
            form.setValue("description", value);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4zm2 3a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <CardTitle>Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
                {isEditMode ? (
                    <Textarea
                        placeholder="Şikayet açıklaması"
                        className="min-h-[100px] resize-none focus:ring-purple-600 focus:border-purple-600"
                        value={localDescription}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                    />
                ) : (
                    <div className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                        {localDescription}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
