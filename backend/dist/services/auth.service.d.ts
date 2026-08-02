import { CreateUserDto, UserWithRoles } from '../models/types';
export declare class AuthService {
    register(dto: CreateUserDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Omit<UserWithRoles, 'password_hash'>;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Omit<UserWithRoles, 'password_hash'>;
    }>;
    private getOAuthClient;
    getGoogleAuthUrl(action?: string): Promise<string>;
    handleGoogleCallback(code: string, action?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Omit<UserWithRoles, 'password_hash'>;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<void>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    private findUserWithRoles;
    private generateTokens;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map