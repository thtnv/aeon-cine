import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { apiCache } from '../utils/cache';

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const cached = apiCache.get('all_movies');
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      return res.json(cached);
    }

    const movies = await prisma.movie.findMany({
      orderBy: { createdAt: 'desc' }
    });

    apiCache.set('all_movies', movies, 180);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies', error });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({ where: { id: id as string } });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie', error });
  }
};

async function syncMovieGenresAndActors(movieId: string, genreString?: string, actorString?: string) {
  try {
    if (genreString) {
      await prisma.movieGenre.deleteMany({ where: { movieId } });
      const genreNames = genreString.split(',').map(g => g.trim()).filter(Boolean);
      for (const name of genreNames) {
        let genre = await prisma.genre.findUnique({ where: { name } });
        if (!genre) {
          genre = await prisma.genre.create({ data: { name } });
        }
        await prisma.movieGenre.create({
          data: { movieId, genreId: genre.id }
        }).catch(() => {});
      }
    }
    if (actorString) {
      await prisma.movieActor.deleteMany({ where: { movieId } });
      const actorNames = actorString.split(',').map(a => a.trim().replace(/\s*\([^)]*\)/, '')).filter(Boolean);
      for (const name of actorNames) {
        let actor = await prisma.actor.findUnique({ where: { name } });
        if (!actor) {
          actor = await prisma.actor.create({ data: { name } });
        }
        await prisma.movieActor.create({
          data: { movieId, actorId: actor.id }
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Error syncing MovieGenre / MovieActor:', err);
  }
}

export const createMovie = async (req: Request, res: Response) => {
  try {
    const { 
      title, description, genre, duration, trailerUrl, posterUrl, status,
      releaseDate, ageRating, rating, votes, country, producer, director, actors 
    } = req.body;
    
    const movie = await prisma.movie.create({
      data: { 
        title, description, genre, duration, trailerUrl, posterUrl, status,
        releaseDate, ageRating, rating, votes, country, producer, director, actors 
      }
    });

    await syncMovieGenresAndActors(movie.id, genre, actors);

    apiCache.del('all_movies');
    apiCache.clearPattern('showtimes_');
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error creating movie', error });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, description, genre, duration, trailerUrl, posterUrl, status,
      releaseDate, ageRating, rating, votes, country, producer, director, actors 
    } = req.body;
    
    const movie = await prisma.movie.update({
      where: { id: id as string },
      data: { 
        title, description, genre, duration, trailerUrl, posterUrl, status,
        releaseDate, ageRating, rating, votes, country, producer, director, actors 
      }
    });

    if (genre !== undefined || actors !== undefined) {
      await syncMovieGenresAndActors(movie.id, genre ?? movie.genre, actors ?? (movie.actors || undefined));
    }

    apiCache.del('all_movies');
    apiCache.clearPattern('showtimes_');
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error updating movie', error });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id: id as string }
    });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Handle cascading relations safely
    const showtimes = await prisma.showtime.findMany({
      where: { movieId: id as string },
      select: { id: true }
    });
    const showtimeIds = showtimes.map(s => s.id);

    if (showtimeIds.length > 0) {
      // 1. Delete SeatHolds for showtimes
      await prisma.seatHold.deleteMany({
        where: { showtimeId: { in: showtimeIds } }
      });

      // 2. Delete Tickets for showtimes
      await prisma.ticket.deleteMany({
        where: { showtimeId: { in: showtimeIds } }
      });

      // 3. Delete Showtimes
      await prisma.showtime.deleteMany({
        where: { movieId: id as string }
      });
    }

    // 4. Delete Reviews
    await prisma.review.deleteMany({
      where: { movieId: id as string }
    });

    // 5. Delete Movie
    await prisma.movie.delete({
      where: { id: id as string }
    });

    // 6. Sync delete with aeon_cinema_db_vi if available
    try {
      const { Client } = require('pg');
      const clientVi = new Client({ connectionString: 'postgresql://postgres:123456@localhost:5432/aeon_cinema_db_vi' });
      await clientVi.connect();

      const stVi = await clientVi.query('SELECT "maSuatChieu" FROM "SuatChieu" WHERE "maPhim" = $1', [id]);
      if (stVi.rows.length > 0) {
        const stIds = stVi.rows.map((r: any) => r.maSuatChieu);
        await clientVi.query('DELETE FROM "VeXemPhim" WHERE "maSuatChieu" = ANY($1)', [stIds]);
        await clientVi.query('DELETE FROM "KhoaGiuGheTamThoi" WHERE "maSuatChieu" = ANY($1)', [stIds]);
        await clientVi.query('DELETE FROM "SuatChieu" WHERE "maPhim" = $1', [id]);
      }
      await clientVi.query('DELETE FROM "DanhGiaBinhLuan" WHERE "maPhim" = $1', [id]);
      await clientVi.query('DELETE FROM "Phim" WHERE "maPhim" = $1', [id]);
      await clientVi.end();
    } catch (viErr: any) {
      console.warn('Could not sync movie deletion to VI db:', viErr.message);
    }

    apiCache.del('all_movies');
    apiCache.clearPattern('showtimes_');
    res.json({ message: 'Xóa phim thành công!', id, title: movie.title });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ message: 'Lỗi khi xóa phim', error });
  }
};

