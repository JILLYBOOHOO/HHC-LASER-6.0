import { Request, Response } from 'express';
export declare const registerValidators: import("express-validator").ValidationChain[];
export declare const loginValidators: import("express-validator").ValidationChain[];
export declare const forgotPasswordValidators: import("express-validator").ValidationChain[];
export declare const resetPasswordValidators: import("express-validator").ValidationChain[];
export declare class AuthController {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    googleRedirect(req: Request, res: Response): Promise<void>;
    googleCallback(req: Request, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    me(req: Request, res: Response): Promise<void>;
    private setRefreshTokenCookie;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map