import { Request, Response } from 'express'
import categoryModels from '../models/categoryModels'


const categoryCtrl = {
  createCategory: async (req: Request, res: Response): Promise<void> => {
    try {

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
}


export default categoryCtrl;