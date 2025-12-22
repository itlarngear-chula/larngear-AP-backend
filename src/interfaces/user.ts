import { TDepartmentColors, TDepartment } from './department';

export interface CreateUserDTO {
    studentId: string;
    displayName: string;
    userId: string;
}

export interface UpdateUserDTO {
    enableBot?: boolean;
    selectedDepartments?: TDepartment[];
    displayName?: string;
    selectedColors?: Record<TDepartment, TDepartmentColors>;
}

export interface IUser extends CreateUserDTO {
    enableBot: boolean;
    notificationTime: number;
    selectedDepartments: TDepartment[];
    superuser: boolean;
    authorized: boolean;
    selectedColors?: Record<TDepartment, TDepartmentColors>;
}

export interface UpdateSuperUserDTO {
    superuser: boolean;
}

export interface UpdateSuperUserListDTO {
    superuser: boolean;
    users: string[];
}

