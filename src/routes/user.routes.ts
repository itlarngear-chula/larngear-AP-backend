import userController from '@/controllers/user.controller';
import express from 'express';

const router = express.Router();

router.post('/', userController.createUser);

router.get('/', userController.getUsers);

router.get('/:studentId_or_userId', userController.getUserByStudentIdOrUserId);

router.patch('/:studentId_or_userId', userController.updateUser);

router.put('/superuser', userController.updateSuperUserList);

router.patch('/superuser/:studentId', userController.updateSuperUser);



export default router;
