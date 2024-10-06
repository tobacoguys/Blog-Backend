import { Request, Response } from 'express'
import categoryModels from '../models/categoryModels'

const categoryCtrl = {
  createCategory: async (req: Request, res: Response): Promise<void> => {
    try {

      const { name } = req.body;

      const newCategory = new categoryModels({
          name
      });
      await newCategory.save();

      res.status(201).json(newCategory);
  } catch (error) {
      console.error(error);
      res.status(500).json({ 
          message: "Failed"
      });
  }},
}


export default categoryCtrl;