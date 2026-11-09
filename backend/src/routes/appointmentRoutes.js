import { Router } from 'express';
import {
  deleteAppointment,
  getAppointment,
  getAppointments,
  postAppointment,
  putAppointment,
} from '../controllers/appointmentController.js';

const router = Router();

router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.post('/', postAppointment);
router.put('/:id', putAppointment);
router.delete('/:id', deleteAppointment);

export default router;
