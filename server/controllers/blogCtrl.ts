import { Request, Response } from 'express'
import { IReqAuth } from '../config/interface'
import blogModels from '../models/blogModels';
import mongoose from 'mongoose';


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

  getBlogsByCategory: async (req: Request, res: Response): Promise<void> => {
    const { limit, skip } = Pagination(req)

    try {
      const Data = await blogModels.aggregate([
        {
          $facet: {
            totalData: [
              { 
                $match:{ 
                  category: new mongoose.Types.ObjectId(req.params.id) 
                } 
              },
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
              // Sorting
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit }
            ],
            totalCount: [
              { 
                $match: { 
                  category: new mongoose.Types.ObjectId(req.params.id) 
                } 
              },
              { $count: 'count' }
            ]
          }
        },
        {
          $project: {
            count: { $arrayElemAt: ["$totalCount.count", 0] },
            totalData: 1
          }
        }
      ])

      const blogs = Data[0].totalData;
      const count = Data[0].count;

      // Pagination
      let total = 0;

      if(count % limit === 0){
        total = count / limit;
      }else {
        total = Math.floor(count / limit) + 1;
      }

      res.json({ blogs, total })
    } catch (err: any) {
        res.status(500).json({msg: err.message})
    }
  },

  getBlogsByUser: async (req: IReqAuth, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
  
      const { page, limit, skip } = Pagination(req);
  
      const blogs = await blogModels.find({ user: userId })
        .populate("user", "-password")
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const total = await blogModels.countDocuments({ user: userId });
  
      if (!blogs.length) {
        res.status(404).json({ msg: "No blogs found for this user." });
      }
  
      res.json({ blogs, total, page, limit });
    } catch (err: any) {
      res.status(500).json({ msg: err.message });
    }
  },
  getBlog: async (req: Request, res: Response): Promise<void> => {
    try {
      const blog = await blogModels.findOne({_id: req.params.id})
      .populate("user", "-password")

      if(!blog){
        res.status(400).json({ msg: "Blog does not exist." })
      }

        res.json(blog)
    } catch (err: any) {
        res.status(500).json({ msg: err.message })
    }
  },

}


export default blogCtrl;