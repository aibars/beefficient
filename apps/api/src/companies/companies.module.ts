import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './companies.entity';
import { CompanyService } from './companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompaniesModule {}
