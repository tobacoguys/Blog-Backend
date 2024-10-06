import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IReqAuth, IDecodedToken } from '../config/interface';
import { IUser } from '../config/interface';

const auth = async (req: IReqAuth, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Access token is invalid' });
        }

        // Type assertion to IUser
        req.user = decoded as IUser;
        next();
      });
    } else {
      res.status(401).json({ message: 'Access token is missing' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export default auth;
