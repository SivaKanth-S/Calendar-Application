import { Router } from 'express';
import {
  deleteTask,
  getTask,
  getTasks,
  patchTaskStatus,
  postTask,
  putTask,
} from '../controllers/taskController.js';

const router = Router();

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', postTask);
router.put('/:id', putTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', patchTaskStatus);

export default router;
