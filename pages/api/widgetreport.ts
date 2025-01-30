import { NextApiRequest, NextApiResponse } from 'next';
import { Dataset } from '@/lib/dataset';
import { WebWidget, WebWidgetData } from '@/types/tables';
import { formatInTimeZone } from 'date-fns-tz';
import { parseISO } from 'date-fns';

const timeZone = 'Europe/Istanbul';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { date1, date2, reportId, branches } = req.body;

        if (!date1 || !date2 || !reportId || !branches) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const reportIdNumber = parseInt(reportId);
        if (isNaN(reportIdNumber)) {
            return res.status(400).json({ error: 'Invalid report ID format' });
        }

        // Get widget query
        const widgetQuery = `
            SELECT TOP 1 ReportID, ReportQuery, ReportQuery2
            FROM om_webWidgets
            WHERE ReportID = @reportId
            AND IsActive = 1
            AND (ReportQuery != '' OR ReportQuery2 != '')
            ORDER BY ReportIndex ASC
        `;
        const instance = Dataset.getInstance();

        const response = await instance.executeQuery<WebWidget[]>({
            query: widgetQuery,
            parameters: {
                reportId: reportIdNumber
            },
            req
        });
        const widget = response[0];
        if (!widget) {
            return res.status(400).json({ error: 'No widget query found' });
        }

        try {
            const date1Parsed = parseISO(date1);
            const date2Parsed = parseISO(date2);

            const date1Formatted = formatInTimeZone(date1Parsed, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
            const date2Formatted = formatInTimeZone(date2Parsed, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

            const result = await instance.executeQuery<WebWidgetData[]>({
                query: widget.ReportQuery?.toString() + "",
                parameters: {
                    date1: date1Formatted,
                    date2: date2Formatted,
                    BranchID: branches
                },
                req
            });
            if (!result ) {
                return res.status(404).json({ error: 'No data found for widget' });
            }

            return res.status(200).json(result);

        } catch (error: any) {
            console.error('Error executing widget query:', error);
            return res.status(500).json({
                error: 'Error executing widget query',
                details: error.message
            });
        }
    } catch (error: any) {
        console.error('Error in widget report handler:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
