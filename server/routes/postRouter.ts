import express from 'express'
import postCtrl from '../controllers/postCtrl'
import auth from '../middleware/auth'

const router = express.Router()


router.post('/create', auth, postCtrl.createPost)
router.get('/getHomePost', postCtrl.getHomePosts)
router.get('/getPost/category/:id', postCtrl.getPostsByCategory)
router.get('/getBlog/user/:id', postCtrl.getPostsByUser)
router.route('/:id')
  .get(postCtrl.getPostsById)
  .put(auth, postCtrl.updatePost)

export default router;