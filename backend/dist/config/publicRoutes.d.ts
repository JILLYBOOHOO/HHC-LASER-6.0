export type PublicRoute = string | {
    path: string;
    methods?: string[];
};
export declare const PUBLIC_ROUTES: PublicRoute[];
export declare function isPublicRoute(path: string, method: string): boolean;
//# sourceMappingURL=publicRoutes.d.ts.map