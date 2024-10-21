import { Request, Response } from 'express'
import { IReqAuth } from '../config/interface'
import commentModels from '../models/commentModels';


const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.page) * 1 || 1;
  let limit = Number(req.query.limit) * 1 || 4;
  let skip = (page - 1) * limit;

  return { page, limit, skip };
}

const commentCtrl = {
  createComment: async (req: IReqAuth, res: Response): Promise<void> => {
    if(!req.user){
      res.status(400).json({msg: "invalid Authentication."})
      return;
    }

    try {
      const { 
        content,
        post_id,
        post_user_id
      } = req.body

      const newComment = new commentModels({ 
        user: req.user._id,
        content,
        post_id,
        post_user_id
      })

      const data = {
        ...newComment._doc,
        user: req.user,
        createdAt: new Date().toISOString()
      }

      await newComment.save()

      res.json({
        data
      })
      
    } catch (err: any) {
      res.status(500).json({msg: err.message})
    }
  }
}

export default commentCtrl;