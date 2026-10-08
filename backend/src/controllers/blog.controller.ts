import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        authorUser: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(blogs.map(b => ({
      ...b,
      author: b.authorUser?.name || 'Ban Biên Tập Aeon Cine'
    })));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tăng lượt xem và trả về bài viết
    let blog = await prisma.blog.findUnique({
      where: { id: String(id) },
      include: {
        authorUser: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } }
      }
    });

    if (!blog) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    try {
      await prisma.blog.update({
        where: { id: String(id) },
        data: { views: { increment: 1 } }
      });
    } catch {}

    res.json({
      ...blog,
      author: blog.authorUser?.name || 'Ban Biên Tập Aeon Cine'
    });
  } catch (error) {
    console.error('Error fetching blog details:', error);
    res.status(500).json({ message: 'Error fetching blog details', error });
  }
};

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, summary, content, category, publishDate, readingTime, imageUrl, status, authorId, movieId } = req.body;
    if (!title || !summary || !content || !category) {
      return res.status(400).json({ message: 'Tiêu đề, tóm tắt, nội dung và thể loại bài viết là bắt buộc' });
    }

    let validAuthorId: string | null = authorId || null;
    if (validAuthorId) {
      const u = await prisma.user.findUnique({ where: { id: String(validAuthorId) } });
      if (!u) validAuthorId = null;
    }
    if (!validAuthorId) {
      const admin = await prisma.user.findFirst({ where: { roleDetail: { code: 'ADMIN' } } });
      if (admin) validAuthorId = admin.id;
    }

    let validMovieId: string | null = movieId || null;
    if (validMovieId) {
      const m = await prisma.movie.findUnique({ where: { id: String(validMovieId) } });
      if (!m) validMovieId = null;
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        summary,
        content,
        category,
        authorId: validAuthorId,
        movieId: validMovieId,
        publishDate: publishDate || new Date().toISOString().slice(0, 10),
        readingTime: readingTime || '5 phút đọc',
        imageUrl: imageUrl || null,
        status: status || 'ACTIVE'
      },
      include: {
        authorUser: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({
      ...newBlog,
      author: newBlog.authorUser?.name || 'Ban Biên Tập Aeon Cine'
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Error creating blog', error });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, summary, content, category, authorId, publishDate, readingTime, imageUrl, status } = req.body;

    const updated = await prisma.blog.update({
      where: { id: String(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(authorId !== undefined ? { authorId } : {}),
        ...(publishDate !== undefined ? { publishDate } : {}),
        ...(readingTime !== undefined ? { readingTime } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(status !== undefined ? { status } : {})
      },
      include: {
        authorUser: { select: { id: true, name: true } }
      }
    });

    res.json({
      ...updated,
      author: updated.authorUser?.name || 'Aeon Cine Editor'
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Error updating blog', error });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({
      where: { id: String(id) }
    });
    res.json({ message: 'Xóa bài viết thành công' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog', error });
  }
};
