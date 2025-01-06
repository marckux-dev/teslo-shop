import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators';
import { Rol } from '../auth/interfaces/rol.enum';


@Controller('seed')
export class SeedController {

  constructor(
    private readonly seedService: SeedService,
  ) {}

  @Post()
  @Auth(Rol.SUPER_USER)
  seed() {
    return this.seedService.seed();
  }

}