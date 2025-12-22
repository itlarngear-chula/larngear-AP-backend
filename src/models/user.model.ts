import { TDepartmentColors, TDepartment } from '@/interfaces/department';
import mongoose, { Schema, Document, SchemaType } from 'mongoose';

interface User extends Document {
    studentId: string;
    displayName: string;
    userId: string;
    enableBot: boolean;
    notificationTime: 0 | 5 | 10;
    selectedDepartments: string[];
    superuser: boolean;
    authorized: boolean;
    selectedColors: Record<TDepartment, TDepartmentColors>;
}

const UserSchema: Schema<User> = new Schema({
    studentId: { type: String, required: true },
    displayName: { type: String, required: true },
    userId: { type: String, required: true },
    enableBot: { type: Boolean, required: true, default: false },
    notificationTime: { type: Number, required: false, default: 0 },
    selectedDepartments: { type: [String], required: true, default: [] },
    superuser: { type: Boolean, required: true, default: false },
    authorized: { type: Boolean, required: true, default: false },
    selectedColors: { type: Schema.Types.Mixed, required: false, default: {} },
});

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;
