import express from 'express';
import { getActors, createActor, deleteActor, updateActor } from '../controllers/actor.controller';

const router = express.Router();

router.get('/', getActors);
router.post('/', createActor);
router.put('/:id', updateActor);
router.delete('/:id', deleteActor);

export default router;
