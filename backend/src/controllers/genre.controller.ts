import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getGenres = async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
};

export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const genre = await prisma.genre.create({
      data: { name },
    });
    res.status(201).json(genre);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create genre' });
  }
};

export const updateGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const genre = await prisma.genre.update({
      where: { id },
      data: { name },
    });
    res.json(genre);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update genre' });
  }
};

export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    await prisma.genre.delete({
      where: { id },
    });
    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete genre' });
  }
};
