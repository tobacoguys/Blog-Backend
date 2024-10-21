import { Request, Response } from 'express'
import { IReqAuth } from '../config/interface'
import postModels from '../models/postModels';
import mongoose from 'mongoose';
import commentModels from '../models/commentModels';


const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.page) * 1 || 1;
  let limit = Number(req.query.limit) * 1 || 4;
  let skip = (page - 1) * limit;

  return { page, limit, skip };
}

const postCtrl = {
  createPost: async (req: IReqAuth, res: Response): Promise<void> => {
    if(!req.user){
        res.status(400).json({msg: "Invalid Authentication."})
        return;
    }

    if(req.user.role !== 'admin'){
        res.status(400).json({msg: "Only administrators are allowed to create."})
    }

    try {
      const { title, content, cover, createBy, category } = req.body

      const newPost = new postModels({
        user: req.user._id,
        title: title.toLowerCase(), 
        content,
        cover,
        createBy: req.user._id,
        category
      })

      await newPost.save()
      res.json({
        ...newPost._doc,
        user: req.user
      })

    } catch (err: any) {
        res.status(500).json({msg: err.message})
    }
  },

  // getHomePosts: async (req: Request, res: Response): Promise<void> => {
  //   try {
  //       const posts = await postModels.aggregate([
  //           // User
  //           {
  //             $lookup:{
  //               from: "users",
  //               let: { user_id: "$user" },
  //               pipeline: [
  //                 { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
  //                 { $project: { password: 0 }}
  //               ],
  //               as: "user"
  //             }
  //           },
  //           // array -> object
  //           { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  //           // Category
  //           {
  //             $lookup: {
  //               "from": "categories",
  //               "localField": "category",
  //               "foreignField": "_id",
  //               "as": "category"
  //             }
  //           },
  //           // array -> object
  //           { $unwind: "$category" },
  //           // Sorting
  //           { $sort: { "createdAt": -1 } },
  //           // Group by category
  //           {
  //             $group: {
  //               _id: "$category._id",
  //               name: { $first: "$category.name" },
  //               blogs: { $push: "$$ROOT" },
  //               count: { $sum: 1 }
  //             }
  //           },
  //           // Pagination for blogs
  //           {
  //             $project: {
  //               blogs: {
  //                 $slice: ['$blogs', 0, 4]
  //               },
  //               count: 1,
  //               name: 1
  //             }
  //           }
  //         ])
    
  //         res.json(posts)
    
  //   } catch (err: any) {
  //       res.status(500).json({msg: err.message})
  //   }
  // },

  getHomePosts: async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, skip } = Pagination(req);
  
      const totalPosts = await postModels.countDocuments();
  
      const posts = await postModels.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email');
  
      if (!posts.length) {
        res.status(404).json({ msg: 'No posts found.' });
      }

      res.json({
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        posts
      });
    } catch (err: any) {
      res.status(500).json({ msg: err.message });
    }
  },

  getPostsByCategory: async (req: Request, res: Response): Promise<void> => {
    const { limit, skip } = Pagination(req)

    try {
      const Data = await postModels.aggregate([
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

      const posts = Data[0].totalData;
      const count = Data[0].count;

      // Pagination
      let total = 0;

      if(count % limit === 0){
        total = count / limit;
      }else {
        total = Math.floor(count / limit) + 1;
      }

      res.json({ posts, total })
    } catch (err: any) {
        res.status(500).json({msg: err.message})
    }
  },

  getPostsByUser: async (req: IReqAuth, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
  
      const { page, limit, skip } = Pagination(req);
  
      const posts = await postModels.find({ user: userId })
        .populate("user", "-password")
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const total = await postModels.countDocuments({ user: userId });
  
      if (!posts.length) {
        res.status(404).json({ msg: "No blogs found for this user." });
      }
  
      res.json({ posts, total, page, limit });
    } catch (err: any) {
      res.status(500).json({ msg: err.message });
    }
  },
  getPostsById: async (req: Request, res: Response): Promise<void> => {
    try {
      const posts = await postModels.findOne({_id: req.params.id})
      .populate("user", "-password")

      if(!posts){
        res.status(400).json({ msg: "Blog does not exist." })
      }

        res.json(posts)
    } catch (err: any) {
        res.status(500).json({ msg: err.message })
    }
  },
  updatePost: async (req: IReqAuth, res: Response): Promise<void> => {
    if(!req.user){
        res.status(400).json({msg: "Invalid Authentication."})
        return;
    }

    if(req.user.role !== 'admin'){
        res.status(400).json({msg: "Only administrators are allowed to create."})
    }

    try {
      const posts = await postModels.findOneAndUpdate({
        _id: req.params.id, user: req.user._id
      }, req.body)

      if(!posts)
        res.status(400).json({msg: "Invalid Authentication."})

      res.json({ msg: 'Update Success!', posts })

    } catch (err: any) {
        res.status(500).json({msg: err.message})
    }
  },

  deletePost: async (req: IReqAuth, res: Response): Promise<void> => {
    if(!req.user){
      res.status(400).json({msg: "Invalid Authentication."})
      return;
    }

    if(req.user.role !== 'admin'){
      res.status(400).json({msg: "Only administrators are allowed to delete."})
  }

    try {
      // Delete Blog
      const post = await postModels.findOneAndDelete({
        _id: req.params.id, user: req.user._id
      })

      if(!post){ 
        res.status(400).json({msg: "Post does not exist!"})
        return;
      }

      // Delete Comments
      await commentModels.deleteMany({ post_id: post._id })

      res.json({ msg: 'Delete Success!' })

    } catch (err: any) {
      res.status(500).json({msg: err.message})
    }
  },

}


export default postCtrl;