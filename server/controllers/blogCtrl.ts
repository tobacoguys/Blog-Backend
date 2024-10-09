import { Request, Response } from 'express'
import { IReqAuth } from '../config/interface'
import blogModels from '../models/blogModels';


const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.page) * 1 || 1;
  let limit = Number(req.query.limit) * 1 || 4;
  let skip = (page - 1) * limit;

  return { page, limit, skip };
}

const blogCtrl = {
  createBlog: async (req: IReqAuth, res: Response): Promise<void> => {
    if(!req.user){
        res.status(400).json({msg: "Invalid Authentication."})
        return;
    }

    if(req.user.role !== 'admin'){
        res.status(400).json({msg: "Only administrators are allowed to create."})
      }

    try {
      const { title, content, description, cover, category } = req.body

      const newBlog = new blogModels({
        user: req.user._id,
        title: title.toLowerCase(), 
        content,
        description, 
        cover, 
        category
      })

      await newBlog.save()
      res.json({
        ...newBlog._doc,
        user: req.user
      })

    } catch (err: any) {
        res.status(500).json({msg: err.message})
    }
  },

  getHomeBlogs: async (req: Request, res: Response): Promise<void> => {
    try {
        const blogs = await blogModels.aggregate([
            // User
            {
              $lookup:{
                from: "users",
                let: { user_id: "$user" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                  { $project: { password: 0 }}
                ],
                as: "user"
              }
            },
            // array -> object
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            // Category
            {
              $lookup: {
                "from": "categories",
                "localField": "category",
                "foreignField": "_id",
                "as": "category"
              }
            },
            // array -> object
            { $unwind: "$category" },
            // Sorting
            { $sort: { "createdAt": -1 } },
            // Group by category
            {
              $group: {
                _id: "$category._id",
                name: { $first: "$category.name" },
                blogs: { $push: "$$ROOT" },
                count: { $sum: 1 }
              }
            },
            // Pagination for blogs
            {
              $project: {
                blogs: {
                  $slice: ['$blogs', 0, 4]
                },
                count: 1,
                name: 1
              }
            }
          ])
    
          res.json(blogs)
    
    } catch (err: any) {
        res.status(500).json({msg: err.message})
    }
  },
}


export default blogCtrl;