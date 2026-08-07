import { CreateUserDto, UserWithRoles } from '../models/types';
type AuthResult = {
    accessToken: string;
    refreshToken: string;
    user: Omit<UserWithRoles, 'password_hash'>;
};
export declare class AuthService {
    register(dto: CreateUserDto): Promise<AuthResult>;
    login(email: string, password: string): Promise<AuthResult>;
    private registerWithSupabase;
    private loginWithSupabase;
    private signInSupabase;
    private migrateLegacyUserToSupabase;
    private registerLegacy;
    private tryDevLogin;
    private loginLegacy;
    private getOAuthClient;
    getGoogleAuthUrl(action?: string): Promise<string>;
    handleGoogleCallback(code: string, action?: string): Promise<AuthResult>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: number): Promise<void>;
    /**
     * Always resolves successfully to avoid email enumeration.
     * Sends a reset link when an active account exists.
     */
    requestPasswordReset(email: string): Promise<void>;
    resetPasswordWithToken(token: string, newPassword: string): Promise<void>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
    private findUserWithRoles;
    private generateTokens;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map