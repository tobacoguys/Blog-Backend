import express from 'express'
import categoryCtrl from '../controllers/categoryCtrl'
import auth from '../middleware/auth';

const router = express.Router()

router.post('/create', auth, categoryCtrl.createCategory);
router.get('/get', categoryCtrl.getCategories);
router.route('/category/:id')
  .patch(auth, categoryCtrl.updateCategory)
router.delete('/delete/:id',auth, categoryCtrl.deleteCategory);
export default router;