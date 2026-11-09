import { Router } from 'express';
import {
  deleteEvent,
  getEvent,
  getEvents,
  postEvent,
  putEvent,
} from '../controllers/eventController.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', postEvent);
router.put('/:id', putEvent);
router.delete('/:id', deleteEvent);

export default router;
