import { Module } from '@nestjs/common';
import { CampContentController } from './camp-content.controller';
import { CampContentService } from './camp-content.service';

@Module({ controllers: [CampContentController], providers: [CampContentService] })
export class CampContentModule {}
