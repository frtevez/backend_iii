import { Router } from 'express';
import mockController from '../controllers/mock.controller.js';

const router = Router();

router.get('/mockingpets', mockController.generateMockPets);
router.get('/mockingusers', mockController.generateMockUsers);
router.post('/generateData', mockController.generateData);


export default router;