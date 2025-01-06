import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './';

@Entity({
  name: 'product_images',
})
export class ProductImage {

  @PrimaryGeneratedColumn()
  id:number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  url:string;

  @ManyToOne(
    () => Product,
    (product) => product.images,
    { onDelete: 'CASCADE' },
  )
  product?: Product;

}