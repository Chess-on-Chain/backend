import type { Request, Response, NextFunction } from 'express';
import { Token } from '../models/Token';

export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ status: 'bad', detail: 'unauthorized' });
  }

  const tokenObj = await Token.findOne({
    where: {
      token: token.replace("Token", "").trim()
    }
  })

  if (tokenObj) {
    req.userId = tokenObj.user
  }
  next();
}
