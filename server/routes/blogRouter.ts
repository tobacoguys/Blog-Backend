import express from 'express'
import blogCtrl from '../controllers/blogCtrl'
import auth from '../middleware/auth'

const router = express.Router()


router.post('/create', auth, blogCtrl.createBlog)
router.get('/home/blogs', blogCtrl.getHomeBlogs)
router.get('/getBlog/category/:id', blogCtrl.getBlogsByCategory)
router.get('/getBlog/user/:id', blogCtrl.getBlogsByUser)
router.route('/:id')
  .get(blogCtrl.getBlog)

export default router;