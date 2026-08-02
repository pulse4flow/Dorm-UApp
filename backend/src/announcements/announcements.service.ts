import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

const UPLOAD_DIRECTORY = join(process.cwd(), 'uploads', 'announcements');

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.announcement.findMany({
      include: { images: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: { images: { orderBy: { createdAt: 'asc' } } },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  create(data: CreateAnnouncementDto) {
    return this.prisma.announcement.create({ data });
  }

  async update(id: string, data: UpdateAnnouncementDto) {
    await this.findOne(id);
    return this.prisma.announcement.update({ where: { id }, data });
  }

  async addImages(announcementId: string, files: Express.Multer.File[]) {
    const announcement = await this.findOne(announcementId);
    const remainingCapacity = 5 - announcement.images.length;

    if (files.length > remainingCapacity) {
      await this.removeUploadedFiles(files);
      throw new BadRequestException(
        `An announcement can contain at most 5 images; ${remainingCapacity} more can be added`,
      );
    }

    try {
      return await this.prisma.announcementImage.createManyAndReturn({
        data: files.map((file) => ({
          announcementId,
          imageUrl: `/uploads/announcements/${file.filename}`,
        })),
      });
    } catch (error) {
      await this.removeUploadedFiles(files);
      throw error;
    }
  }

  async removeImage(announcementId: string, imageId: string) {
    const image = await this.prisma.announcementImage.findFirst({
      where: { id: imageId, announcementId },
    });

    if (!image) {
      throw new NotFoundException('Announcement image not found');
    }

    await this.removeImageFile(image.imageUrl);
    await this.prisma.announcementImage.delete({ where: { id: imageId } });
    return { message: 'Announcement image deleted successfully' };
  }

  async delete(id: string) {
    const announcement = await this.findOne(id);
    await Promise.all(announcement.images.map((image) => this.removeImageFile(image.imageUrl)));
    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted successfully' };
  }

  private async removeUploadedFiles(files: Express.Multer.File[]) {
    await Promise.all(files.map((file) => unlink(file.path).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    })));
  }

  private async removeImageFile(imageUrl: string) {
    const fileName = basename(imageUrl);
    await unlink(join(UPLOAD_DIRECTORY, fileName)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    });
  }
}
