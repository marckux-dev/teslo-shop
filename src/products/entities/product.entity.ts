import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';

/*
This is the entity class that represents the product entity in the database.
The fields of this class are:
- id: uuid. The primary key of the entity.
- title: string. This field is required and must be unique.
- description: string. This field is optional.
- price: number with 2 fixed decimal places greater than or equal to 0. 0.00 is the default value.
- stock: integer greater than or equal to 0. 0 is the default value.
- slug: string. This field is required and must be unique.
- sizes: string array. This field is optional.
- gender: string. Only allowed values: {"men", "women", "kids", "unisex"}.
- tags: string array. This field is optional.
- images: ProductImage array. This field is optional. The relationship between the Product and ProductImage entities is one-to-many.
 */

@Entity({
  name: 'products',
})
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    }
  })
  price: number;

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  sizes?: string[];

  @Column({
    type: 'enum',
    enum: ['men', 'women', 'kid', 'unisex'],
    nullable: true,
  })
  gender?: string;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  tags?: string[];

  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    {
      cascade: true,
    }
  )
  images?: ProductImage[];

  @ManyToOne(
    () => User,
    (user) => user.products,
    { eager: true },
  )
  user: User;


  @BeforeInsert()
  generateSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }

  @BeforeUpdate()
  updateSlug() {
    this.generateSlug();
  }

}
