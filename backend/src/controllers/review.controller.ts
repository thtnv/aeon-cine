import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getMovieReviews = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { movieId: String(movieId) },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { userId, movieId, rating, comment } = req.body;

    const review = await prisma.review.create({
      data: {
        userId,
        movieId,
        rating: Number(rating),
        comment
      }
    });

    // Update average rating and votes count on Movie
    const aggregations = await prisma.review.aggregate({
      where: { movieId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.movie.update({
      where: { id: movieId },
      data: {
        rating: Math.round((aggregations._avg.rating || 0) * 10) / 10,
        votes: aggregations._count.rating
      }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};
