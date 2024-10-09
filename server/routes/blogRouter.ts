import express from 'express'
import blogCtrl from '../controllers/blogCtrl'
import auth from '../middleware/auth'

const router = express.Router()


router.post('/create', auth, blogCtrl.createBlog)
router.get('/home/blogs', blogCtrl.getHomeBlogs)

export default router;