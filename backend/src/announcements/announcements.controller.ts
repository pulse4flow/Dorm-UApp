import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const UPLOAD_DIRECTORY = join(process.cwd(), 'uploads', 'announcements');
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const imageUploadOptions = {
  storage: diskStorage({
    destination: (_request, _file, callback) => {
      mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
      callback(null, UPLOAD_DIRECTORY);
    },
    filename: (_request, file, callback) => {
      const extension = file.mimetype.split('/')[1];
      callback(null, `${randomUUID()}.${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_request: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
      return;
    }
    callback(null, true);
  },
};

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findAll() {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('manager')
  create(@Body() data: CreateAnnouncementDto) {
    return this.announcementsService.create(data);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  update(@Param('id') id: string, @Body() data: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, data);
  }

  @Post(':id/images')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @UseInterceptors(FilesInterceptor('images', 5, imageUploadOptions))
  @ApiOperation({ summary: 'Upload up to 5 JPEG, PNG, or WebP images for an announcement' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  uploadImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[] = []) {
    if (files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    return this.announcementsService.addImages(id, files);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(RolesGuard)
  @Roles('manager')
  @ApiOperation({ summary: 'Delete an announcement image' })
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.announcementsService.removeImage(id, imageId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  delete(@Param('id') id: string) {
    return this.announcementsService.delete(id);
  }
}
