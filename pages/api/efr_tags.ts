import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { Efr_Tags } from '@/types/tables';

interface TagWithBranches extends Efr_Tags {
    BranchID: number[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const instance = Dataset.getInstance();
        
        // Tag ve Branch eşleşmelerini tek sorguda al
        const query = `
        SELECT DISTINCT
            ef.TagID,
            ef.TagTitle,
            ef.IsDefault,
            ef.CurrencyName
        FROM
            efr_Tags ef WITH (NOLOCK)
        INNER JOIN 
            efr_BranchTags eb WITH (NOLOCK) ON eb.TagID = ef.TagID`;

        const branchTagsQuery = `
        SELECT
            ef.TagID,
            eb.BranchID
        FROM
            efr_Tags ef WITH (NOLOCK)
        INNER JOIN 
            efr_BranchTags eb WITH (NOLOCK) ON eb.TagID = ef.TagID
        ORDER BY 
            ef.TagID, eb.BranchID`;

        // Her iki sorguyu da paralel olarak çalıştır
        const [tags, branchTags] = await Promise.all([
            instance.executeQuery<Efr_Tags[]>({ query, req }),
            instance.executeQuery<{ TagID: number; BranchID: number }[]>({ query: branchTagsQuery, req })
        ]);

        if (!tags || tags.length === 0) {
            return res.status(404).json({ error: 'No tags found' });
        }

        // Her tag için branch ID'leri grupla
        const result: TagWithBranches[] = tags.map(tag => ({
            ...tag,
            BranchID: branchTags
                .filter(bt => bt.TagID === tag.TagID)
                .map(bt => bt.BranchID)
        }));

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error in tag handler:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}
