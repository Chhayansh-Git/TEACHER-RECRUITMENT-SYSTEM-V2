// src/middleware/authorizeRoles.middleware.ts

import { Response, NextFunction } from 'express';
import { ProtectedRequest } from './auth.middleware';

const authorizeRoles = (...roles: string[]) => {
  return (req: ProtectedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Forbidden: User role (${req.user?.role}) is not authorized to access this route`);
    }
    next();
  };
};

export { authorizeRoles };