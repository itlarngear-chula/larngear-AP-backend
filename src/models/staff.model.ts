import mongoose, { Document, Schema } from 'mongoose';

export interface StaffRecord {
    studentId: string;
    name: string;
    nickname: string;
    year: string;
    department: string;
}

interface Staff extends StaffRecord, Document {}

const StaffSchema: Schema<Staff> = new Schema(
    {
        studentId: { type: String, required: true },
        name: { type: String, required: true },
        nickname: { type: String, required: true },
        year: { type: String, required: true },
        department: { type: String, required: true },
    },
    { collection: 'staffs' }
);

const StaffModel = mongoose.model<Staff>('Staff', StaffSchema);

export default StaffModel;
