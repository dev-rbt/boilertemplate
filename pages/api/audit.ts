import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';

interface AuditData {
    month: number;
    monthName: string;
    registrationCount: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { branches, date } = req.body;

    if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
    }

    try {
        const auditQuery = `
        ;WITH Aylar AS (
    SELECT 1 as AyNo, N'Ocak' as TurkceAy UNION 
    SELECT 2, N'Şubat' UNION 
    SELECT 3, N'Mart' UNION 
    SELECT 4, N'Nisan' UNION 
    SELECT 5, N'Mayıs' UNION 
    SELECT 6, N'Haziran' UNION
    SELECT 7, N'Temmuz' UNION 
    SELECT 8, N'Ağustos' UNION 
    SELECT 9, N'Eylül' UNION 
    SELECT 10, N'Ekim' UNION 
    SELECT 11, N'Kasım' UNION 
    SELECT 12, N'Aralık'
)
SELECT 
    a.AyNo as month,
    a.TurkceAy as monthName,
    COUNT(wb.AuditDate) as registrationCount
FROM 
    Aylar a WITH (NOLOCK)
    INNER JOIN webBranchAuditRecords wb WITH (NOLOCK) ON 
        MONTH(wb.AuditDate) = a.AyNo
        AND YEAR(wb.AuditDate) = YEAR(@date)
        AND wb.@BranchID 
GROUP BY 
    a.AyNo,
    a.TurkceAy
ORDER BY 
    a.AyNo`;

        const instance = Dataset.getInstance();

        const results = await instance.executeQuery<AuditData[]>({
            query: auditQuery,
            parameters: {
                date: date,
                BranchID: branches,
            },
            req
        });
        return res.status(200).json(results);

    } catch (error: any) {
        console.error('Error in audit handler:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}