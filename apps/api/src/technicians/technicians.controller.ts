import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { TechniciansService } from './technicians.service';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  async findAll() {
    return { data: await this.techniciansService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.techniciansService.findOne(id) };
  }

  @Get(':id/producers')
  async getProducers(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.techniciansService.getProducers(id) };
  }
}
