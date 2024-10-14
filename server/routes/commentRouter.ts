import express from 'express'
import commentCtrl from '../controllers/commentCtrl'
import auth from '../middleware/auth'

const router = express.Router()

router.post('/create', auth, commentCtrl.createComment)


export default router;