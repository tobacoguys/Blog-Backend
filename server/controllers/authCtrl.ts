import { Request, Response, NextFunction } from 'express';
import Users from '../models/userModels';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateActiveToken} from '../config/generateToken'

const authCtrl = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      const user = await Users.findOne({ email });
      if (user) {
        res.status(400).json({ msg: 'Email already exists' });
        return; 
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = ({name, email, password: passwordHash });


      const active_token = generateActiveToken(newUser);

      res.json({ 
        status: 'OK',
        msg: 'Register successfully', 
        data: newUser,
        active_token
      });
    } catch (err) {
      next(err);  
    }
  },
};

export default authCtrl;
