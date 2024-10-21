import express from 'express'
import postCtrl from '../controllers/postCtrl'
import auth from '../middleware/auth'

const router = express.Router()


router.post('/create', auth, postCtrl.createPost)
router.get('/getHomePost', postCtrl.getHomePosts)
router.get('/getPost/category/:id', postCtrl.getPostsByCategory)
router.get('/getPost/user/:id', postCtrl.getPostsByUser)
router.route('/:id')
  .get(postCtrl.getPostsById)
  .put(auth, postCtrl.updatePost)
router.delete('/deletePost/:id', auth, postCtrl.deletePost)

export default router;