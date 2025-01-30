import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DatabaseResponse } from "@/types/dataset";
import { Dataset } from "@/lib/dataset";
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface FormatNumberOptions {
    decimals?: number;
    delimiter?: string;
    decimalPoint?: string;
    prefix?: string;
    suffix?: string;
}

interface IntlFormatNumberOptions {
    locale?: string;
    style?: 'decimal' | 'currency' | 'percent' | 'unit';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
}



export const getLucideIcon = (iconName: string | undefined, defaultIcon?: LucideIcon): LucideIcon => {
    if (!iconName) return defaultIcon || LucideIcons.HelpCircle;
    
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
    return Icon || defaultIcon || LucideIcons.HelpCircle;
};

const databaseCache = new Map<string, { database: DatabaseResponse | undefined; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika


export async function checkTenantDatabase(tenantId: string): Promise<DatabaseResponse | undefined> {
    if(process.env.IS_BOLT) {
        try {
            const instance = Dataset.getInstance();
            const databases = await instance.getDatabase<DatabaseResponse[]>();
            const database = databases.find(item => item.tenantId === new TextEncoder().encode(process.env.BOLTTENANT)?.toString());
            return database;
        } catch (error) {
            return undefined;
        }
    }else{
        const cached = databaseCache.get(tenantId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.database !== undefined) {
            return cached.database;
        }
           
        try {
            const instance = Dataset.getInstance();
            const databases = await instance.getDatabase<DatabaseResponse[]>();
            const database = databases.find(item => item.tenantId === tenantId);
            databaseCache.set(tenantId, { database, timestamp: Date.now() });
            return database;
        } catch (error) {
            return undefined;
        }
    }

}



export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
    }).format(amount);
};


export const formatDateTimeDMY = (date: Date | undefined) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export const formatDateTimeYMDHIS = (date: Date | undefined) => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatDateTimeYMDHI = (date: Date | undefined) => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const formatDateTimeDMYHI = (date: Date | undefined) => {
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}


export const formatNumber = (
    value: number | string | null | undefined,
    options: FormatNumberOptions = {}
): string => {
    const {
        decimals = 2,
        delimiter = ',',
        decimalPoint = '.',
        prefix = '',
        suffix = ''
    } = options;

    try {
        if (value === null || value === undefined) {
            return '';
        }

        const number = typeof value === 'string'
            ? parseFloat(value.replace(/[^\d.-]/g, ''))
            : value;

        if (isNaN(number)) {
            return '';
        }

        const isInteger = Number.isInteger(number);
        const actualDecimals = isInteger ? 0 : decimals;

        const [integerPart, decimalPart] = Math.abs(number)
            .toFixed(actualDecimals)
            .split('.');

        const formattedIntegerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            delimiter
        );

        const sign = number < 0 ? '-' : '';

        return `${prefix}${sign}${formattedIntegerPart}${decimalPart ? decimalPoint + decimalPart : ''}${suffix}`;
    } catch (error) {
        console.error('Formatlama hatası:', error);
        return value?.toString() || '';
    }
}

export const formatNumberIntl = (
    value: number | string | null | undefined,
    options: IntlFormatNumberOptions = {}
): string => {
    const {
        locale = 'tr-TR',
        style = 'decimal',
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        currency
    } = options;

    try {
        if (value === null || value === undefined) {
            return '';
        }

        const number = typeof value === 'string'
            ? parseFloat(value.replace(/[^\d.-]/g, ''))
            : value;

        if (isNaN(number)) {
            return '';
        }

        const isInteger = Number.isInteger(number);

        const formatter = new Intl.NumberFormat(locale, {
            style,
            currency,
            minimumFractionDigits: isInteger ? 0 : minimumFractionDigits,
            maximumFractionDigits
        });

        return formatter.format(number);
    } catch (error) {
        console.error('Formatlama hatası:', error);
        return value?.toString() || '';
    }
}

export function extractTenantId(referer: string | undefined): string {

    if (!referer) {
        return '';
    }
    try {
        const tenantId = new URL(referer).pathname.replace(process.env.NEXT_PUBLIC_BASEPATH ||'', '').split("/")[1] || '';
        return tenantId;
    } catch (error) {
        console.error('Error parsing referer:', error);
        return '';
    }
}
