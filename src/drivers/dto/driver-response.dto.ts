import { Company, Driver, DriverStatus, User, UserRole } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

type DriverWithRelations = Driver & {
  user: User & { roles: UserRole[] };
  company: Company;
};

export class DriverResponseDto {
  userId: string;
  status: DriverStatus;
  licenseUrl: string | null;
  vehicleRegUrl: string | null;
  bgCheckUrl: string | null;
  createdAt: Date;
  user: UserResponseDto;
  company: {
    id: string;
    taxId: string;
    legalName: string;
    type: string;
    plan: string | null;
  };

  static from(driver: DriverWithRelations): DriverResponseDto {
    const dto = new DriverResponseDto();
    dto.userId = driver.userId;
    dto.status = driver.status;
    dto.licenseUrl = driver.licenseUrl;
    dto.vehicleRegUrl = driver.vehicleRegUrl;
    dto.bgCheckUrl = driver.bgCheckUrl;
    dto.createdAt = driver.createdAt;
    dto.user = UserResponseDto.from(driver.user);
    dto.company = {
      id: driver.company.id,
      taxId: driver.company.taxId,
      legalName: driver.company.legalName,
      type: driver.company.type,
      plan: driver.company.plan,
    };
    return dto;
  }
}
