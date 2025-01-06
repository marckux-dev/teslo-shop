import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {

  //Create a logger instance for the service
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    // Inject the ProductRepository
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    // Inject the ProductImageRepository
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    // Inject the datasource
    private readonly datasource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      // Create a new product entity using the repository. This will assign an id to the entity.
      // Get the image urls from the createProductDto, if not present, set it to an empty array
      const {images = [], ...productData} = createProductDto;

      const product = this.productRepository.create({
        ...productData,
        user,
        images: images.map( url => this.productImageRepository.create({url}))
      });

      // Save the product to the database
      await this.productRepository.save(product);

      return {...product, images};

    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    // Find all products in the database and return them
    const {limit = 10, offset = 0} = paginationDto;
    // Find all products in the database and return them with their images
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true },
    });
    return products.map(this.flattenImages);

  }

  async findOne(id: string) {
    // Find a product by id or slug, and return it
    // If not found, throw a 404 error

    let product: Product;

    if (isUUID(id)) {
      product = await this.productRepository.findOne({where: {id}, relations: {images: true}});
    } else {
      product = await this.productRepository.findOne({where: {slug: id}, relations: {images: true}});
    }

    if (!product) {
      throw new BadRequestException(`Product with id or slug ${id} not found`);
    }
    return product;
  }

  async findOneFlattenImages(id: string) {
    const product = await this.findOne(id);
    return this.flattenImages(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    // Split the images and the product data from the updateProductDto
    const {images, ...productDataToUpdate} = updateProductDto;

    // Find the product by id and load the images
    const oldProduct = await this.findOne(id);
    // Merge the old product with the new data
    const product = this.productRepository.merge(oldProduct, productDataToUpdate);

    // Create a query runner to handle the transaction
    const queryRunner = this.datasource.createQueryRunner();
    // Start the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Remove all the images from the product
        await queryRunner.manager.delete(ProductImage, {product});
        // Add the new images to the product
        product.images = images.map(url => this.productImageRepository.create({url}));
      }

      await queryRunner.manager.save(product);
      // Commit the transaction
      await queryRunner.commitTransaction();
      // Release the query runner
      await queryRunner.release();
      // Return the product with the images
      return this.flattenImages(product);

    } catch (error) {
      // Rollback the transaction if an error occurs
      await queryRunner.rollbackTransaction();
      this.handleDatabaseError(error);
    }


  }

  async remove(id: string) {

    const product = await this.findOne(id);
    try {
      // Try to remove the product from the database
      await this.productRepository.remove(product);
      return product;
    } catch (error) {
      this.handleDatabaseError(error);
    }

  }

  private handleDatabaseError(error: any) {
    // Handle database errors
    if (error.code === '23505') {
      // Unique constraint violation
      throw new BadRequestException(`Product with the same title or slug already exists.`);
    }
    this.logger.error(`Error code: ${error.code} - Detail:${error.detail}`);
    throw new InternalServerErrorException(`Something went wrong. See logs for more information.`);
  }

  private flattenImages(product: Product) {
    return {
      ...product,
      images: product.images.map(({url}) => url),
    };
  }

  // Not for production
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

}
