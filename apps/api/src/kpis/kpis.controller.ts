import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { KpisService } from './kpis.service';

@Controller('kpis')
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get()
  async findAll() {
    return { data: await this.kpisService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.kpisService.findOne(id) };
  }
}
