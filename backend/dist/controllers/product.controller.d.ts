import { Request, Response } from 'express';
export declare const productController: {
    getAllProducts(req: Request, res: Response): Promise<void>;
    getProductBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCategories(req: Request, res: Response): Promise<void>;
    createProduct(req: Request, res: Response): Promise<void>;
    updateProduct(req: Request, res: Response): Promise<void>;
    deleteProduct(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=product.controller.d.ts.map