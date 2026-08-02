import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Typed Express async route handler wrapper.
 * Allows clean async/await in route callbacks without implicit any.
 */
export const handler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
