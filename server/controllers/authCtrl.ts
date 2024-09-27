import { Request, Response, NextFunction } from 'express';
import Users from '../models/userModels';
import bcrypt from 'bcrypt';

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

      const newUser = new Users({
        name,
        email,
        password: passwordHash,
      });

      await newUser.save();

      res.json({ 
        status: 'OK',
        msg: 'Register successfully', 
        data: newUser 
      });
    } catch (err) {
      next(err);  
    }
  },
};

export default authCtrl;
