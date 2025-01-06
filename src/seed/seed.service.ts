import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto';



@Injectable()
export class SeedService{

  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: AuthService,
  ) {}

  async seed(){
    await this.deleteAllProducts();
    await this.deleteAllUsers();
    const user:User = await this.insertNewUsers();
    await this.insertNewProducts(user);
    return 'Seeding completed';
  }

  private async deleteAllUsers(){
    return this.usersService.deleteAllUsers();
  }

  private async deleteAllProducts(){
    return this.productsService.deleteAllProducts();
  }

  private async insertNewUsers(): Promise<User> {
    const usersToInsert: CreateUserDto[] = initialData.users;
    const arrayOfPromises = [];
    try {
      usersToInsert.forEach((createUserDto) => {
        arrayOfPromises.push(this.usersService.create(createUserDto));
      });
      // Wait until all users are created
      const users = await Promise.all(arrayOfPromises);
      return users[0];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(`Error seeding data: ${error.message}`);
    }
  }

  private async insertNewProducts(user: User){
    const productsToInsert: any[] = initialData.products;
    const arrayOfPromises = [];
    try {
      productsToInsert.forEach((createProductDto) => {
        arrayOfPromises.push(this.productsService.create(createProductDto, user));
      });
      // Wait until all products are created
      await Promise.all(arrayOfPromises);
      return 'Seeding completed';

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(`Error seeding data: ${error.message}`);
    }

  }
}