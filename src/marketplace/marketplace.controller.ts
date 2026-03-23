import { Controller, Get, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { SearchDriversDto } from './dto/search-drivers.dto';
import { DriverListingResponseDto } from './dto/driver-listing-response.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('drivers')
  @Public()
  searchDrivers(
    @Query() query: SearchDriversDto,
  ): Promise<DriverListingResponseDto[]> {
    return this.marketplaceService.searchDrivers(query);
  }
}
