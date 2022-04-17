import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly prisma: PrismaService) { }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId
      }
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId
      },
    });
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto
      }
    });
    return bookmark;
  }

  async editBookmark(userId: number, dto: EditBookmarkDto, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId
      }
    });

    if (!bookmark) {
      throw new ForbiddenException('Bookmark not found');
    }

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId
      },
      data: {
        ...dto
      }
    });
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        userId,
        id: bookmarkId
      }
    });

    if (!bookmark) {
      throw new ForbiddenException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId
      }
    });
  }

}
