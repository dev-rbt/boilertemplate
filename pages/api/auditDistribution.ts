import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';


interface AuditDistributionData {
    form: string;
    count: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { branches, date } = req.body;

        if (!branches || !Array.isArray(branches) || !date) {
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        const query = `
        SELECT 
   COUNT(wb.AuditID) as countOfAudits,
   we.FormName as formName,
   YEAR(wb.AuditDate) as auditYear
FROM 
    webBranchAuditRecords wb WITH (NOLOCK)
    INNER JOIN webBranchAuditForms we WITH (NOLOCK) on wb.FormID = we.AutoID
WHERE 
    YEAR(wb.AuditDate) = CASE 
        WHEN YEAR(@date1) = YEAR(GETDATE()) THEN YEAR(GETDATE())
        ELSE YEAR(@date1) END
    AND wb.@BranchID
GROUP BY
    we.FormName,
    YEAR(wb.AuditDate)
ORDER BY 
    COUNT(wb.AuditID) DESC`;

        const instance = Dataset.getInstance();
        const results = await instance.executeQuery<AuditDistributionData[]>({
            query,
            parameters: {
                date1: date,
                BranchID: branches,
            },
            req
        });

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error in audit distribution:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}