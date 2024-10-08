import { Request, Response } from 'express'
import categoryModels from '../models/categoryModels'
import { IReqAuth } from '../config/interface'


const categoryCtrl = {
  createCategory: async (req: IReqAuth, res: Response): Promise<void> => {
    try {
      if(!req.user){
        res.status(400).json({msg: "Invalid Authentication."})
        return;
      }

      if(req.user.role !== 'admin'){
        res.status(400).json({msg: "Only administrators are allowed to create."})
      }

      const { name } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Category name is required' });
      }

      const categoryExists = await categoryModels.findOne({ name });
      if (categoryExists) {
        res.status(400).json({ message: 'The category name already exists' });
      }

      const newCategory = new categoryModels({ name });
      await newCategory.save();

      res.status(201).json(newCategory);
  } catch (error) {
      console.error(error);
      res.status(500).json({ 
          message: "Failed"
      });
  }},

  getCategories: async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await categoryModels.find().sort("-createdAt")
      res.json({ categories })
    } catch (err: any) {
        res.status(500).json({ msg: err.message })
    }
  },

  updateCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await categoryModels.findOneAndUpdate({
        _id: req.params.id
      }, { name: (req.body.name).toLowerCase() })

      if (!category) {
        res.status(404).json({ msg: 'Category not found' });
      }
      res.json({ msg: "Update Success!" })
    } catch (err: any) {
      res.status(500).json({ msg: err.message })
    }
  },

  deleteCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await categoryModels.findByIdAndDelete(req.params.id)
      if(!category) 
        res.status(400).json({msg: "Category does not exists."})

      res.json({ msg: "Delete Success!" })
    } catch (err: any) {
      res.status(500).json({ msg: err.message })
    }
  }
}

  

export default categoryCtrl;