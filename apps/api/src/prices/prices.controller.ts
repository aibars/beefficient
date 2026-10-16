import { Controller, Get, Param, Query } from '@nestjs/common';
import { PricesService } from './prices.service';
import { ListPricesQueryDto } from './dtos/price.dto';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get()
  async findAll(@Query() query: ListPricesQueryDto) {
    return { data: await this.pricesService.findAll(query.category) };
  }

  @Get('commodity/:commodity')
  async findByCommodity(@Param('commodity') commodity: string) {
    return { data: await this.pricesService.findByCommodity(commodity) };
  }
}
