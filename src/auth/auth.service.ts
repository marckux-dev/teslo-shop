import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword
      })
      await this.userRepository.save(user);
      const { id } = user;
      return {
        ...user,
        token: this.getJwtToken({ id })
      };

    } catch (error) {
      this.handleDatabaseError(error);
    }

  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password']
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { id } = user;

    return {
      ...user,
      token: this.getJwtToken({ id })
    }
  }

  async deleteAllUsers() {
    const query = this.userRepository.createQueryBuilder('user');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private getJwtToken( payload: JwtPayloadInterface) {
    return this.jwtService.sign(payload);
  }


  private handleDatabaseError(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException('User with that email already exists');
    } else {
      this.logger.error(error.message);
      throw new InternalServerErrorException('Something went wrong');
    }

  }

  checkAuthStatus(user: User) {
    const { id, email, fullName } = user;
    const token = this.getJwtToken({ id });
    return { id, email, fullName, token };
  }
}
