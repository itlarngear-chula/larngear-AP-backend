import staffService from '@/services/staff.service';
import { Request, Response } from 'express';

async function syncFromSheet(req: Request, res: Response) {
    try {
        const result = await staffService.syncFromSheet('Staff');

        return res.status(200).send({
            success: true,
            message: `Synced ${result.syncedCount} staff records and removed ${result.removedCount}`,
            data: result,
        });
    } catch (error) {
        console.error('Error syncing staff from Google Sheets', error);
        return res.status(500).send({
            success: false,
            message: 'Error syncing staff data',
        });
    }
}

export default { syncFromSheet };
