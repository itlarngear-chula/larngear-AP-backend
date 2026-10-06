import axios from 'axios';
import StaffModel, { StaffRecord } from '@/models/staff.model';

const findByStudentId = async (studentId: string) => {
    return StaffModel.findOne({ studentId });
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function requiredString(value: unknown, field: string, row: number): string {
    if (value === undefined) {
        throw new Error(
            `Missing ${field} in staff sheet row ${row}; deploy the latest Apps Script and verify the Staff column mapping`
        );
    }

    if (
        (typeof value !== 'string' && typeof value !== 'number') ||
        value === null
    ) {
        throw new Error(`Invalid ${field} in staff sheet row ${row}`);
    }

    const result = String(value).trim();
    if (!result) {
        throw new Error(`Missing ${field} in staff sheet row ${row}`);
    }

    return result;
}

async function getStaffFromSheet(sheet: string): Promise<StaffRecord[]> {
    const sheetApi = process.env.AP_SHEET_API;
    if (!sheetApi) {
        throw new Error('AP_SHEET_API is not configured');
    }

    const response = await axios.get<unknown>(sheetApi, {
        params: {
            action: 'getSlots',
            sheet,
        },
    });

    if (
        !isRecord(response.data) ||
        response.data.success !== true ||
        !Array.isArray(response.data.data)
    ) {
        throw new Error('Google Sheets returned an invalid staff response');
    }

    const staff = response.data.data.map((row, index): StaffRecord => {
        if (!isRecord(row)) {
            throw new Error(`Invalid staff sheet row ${index + 1}`);
        }

        return {
            studentId: requiredString(row.studentId, 'studentId', index + 1),
            name: requiredString(row.name, 'name', index + 1),
            nickname: requiredString(row.nickname, 'nickname', index + 1),
            year: requiredString(row.year, 'year', index + 1),
            department: requiredString(
                row.department,
                'department',
                index + 1
            ),
        };
    });

    if (staff.length === 0) {
        throw new Error('Staff sheet is empty; refusing to remove existing staff');
    }

    const studentIds = new Set(staff.map((record) => record.studentId));
    if (studentIds.size !== staff.length) {
        throw new Error('Staff sheet contains duplicate student IDs');
    }

    return staff;
}

async function syncFromSheet(sheet: string) {
    const staff = await getStaffFromSheet(sheet);

    await StaffModel.bulkWrite(
        staff.map((record) => ({
            updateOne: {
                filter: { studentId: record.studentId },
                update: { $set: record },
                upsert: true,
            },
        }))
    );

    const studentIds = staff.map((record) => record.studentId);
    const removal = await StaffModel.deleteMany({
        studentId: { $nin: studentIds },
    });

    return {
        syncedCount: staff.length,
        removedCount: removal.deletedCount,
    };
}

export default { findByStudentId, syncFromSheet };
