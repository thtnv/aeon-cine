import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getActors = async (req: Request, res: Response) => {
  try {
    const actors = await prisma.actor.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(actors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch actors' });
  }
};

export const createActor = async (req: Request, res: Response) => {
  try {
    const { name, avatarUrl } = req.body;
    const actor = await prisma.actor.create({
      data: { name, avatarUrl },
    });
    res.status(201).json(actor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create actor' });
  }
};

export const updateActor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, avatarUrl } = req.body;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const actor = await prisma.actor.update({
      where: { id },
      data: { name, avatarUrl },
    });
    res.json(actor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update actor' });
  }
};

export const deleteActor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    await prisma.actor.delete({
      where: { id },
    });
    res.json({ message: 'Actor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete actor' });
  }
};
