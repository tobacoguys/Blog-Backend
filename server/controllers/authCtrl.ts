import { Request, Response, NextFunction } from 'express';
import Users from '../models/userModels';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateActiveToken, generateRefreshToken} from '../config/generateToken'
import { IUser } from '../config/interface';
import userModels from '../models/userModels';
import { error } from 'console';


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

      const newUser = new Users({ name, email, password: passwordHash });
      
      await newUser.save();

      const active_token = generateActiveToken(newUser.toObject());


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

  // login: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //     const { email, password } = req.body;

  //     const user = await Users.findOne({ email });
  //     if (!user) {
  //       res.status(400).json({ msg: 'This account does not exist.' });
  //       return;
  //     }

  //     loginUser(user, password, res);
  //   } catch (err: any) {
  //     res.status(500).json({ msg: err.message });
  //   }
  // },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await userModels.findOne({ email });
        if (!user) {
            throw new Error("Incorrect email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error("Incorrect email or password");
        }
        const payload = {
            id: user.id,
            email: user.email,
            password: user.password,
            role: user.role
        };
        const token = jwt.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, { expiresIn: '1h' });
        res.status(200).send({
            message: "Login successful",
            access_token: token,
            data: payload
        });
    } catch (e) {
        res.status(400).json({
            msg: "Server error"
        });
    }
},
};

export default authCtrl;

// const loginUser = async (user: IUser, password: string, res: Response) => {
//   const isMatch = await bcrypt.compare(password, user.password);

//   if (!isMatch) {
//       const msgError = user.type === 'register' 
//           ? 'Password is incorrect.' 
//           : `Password is incorrect. This account logs in with ${user.type}`;

//       return res.status(400).json({ msg: msgError });
//   }

//   const access_token = generateAccessToken({ id: user._id });
//   console.log('Access Token:', access_token);

//   const refresh_token = generateRefreshToken({ id: user._id }, res);

//   await Users.findOneAndUpdate({ _id: user._id }, { rf_token: refresh_token });

//   res.json({
//       msg: 'Login Success!',
//       access_token,
//       user: { ...user.toObject(), password: '' }  
//   });
// };


