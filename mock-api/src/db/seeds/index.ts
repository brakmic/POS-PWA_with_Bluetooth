import { Knex } from 'knex';
import { products } from './products';
import { categories } from './categories';
import { customers } from './customers';

export async function seedDatabase(db: Knex) {
  // Check if data already exists
  const productCount = await db('products').count('* as count').first();
  
  if (productCount && productCount.count > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }

  // Insert seed data
  await Promise.all([
    seedProducts(db),
    seedCategories(db),
    seedCustomers(db)
  ]);
}

async function seedProducts(db: Knex) {
  // Insert products with stringified attributes
  const productsWithStringifiedAttrs = products.map(product => ({
    ...product,
    attributes: product.attributes ? JSON.stringify(product.attributes) : null
  }));
  
  await db('products').insert(productsWithStringifiedAttrs);
  console.log(`Seeded ${products.length} products`);
}

async function seedCategories(db: Knex) {
  await db('categories').insert(categories);
  console.log(`Seeded ${categories.length} categories`);
}

async function seedCustomers(db: Knex) {
  await db('customers').insert(customers);
  console.log(`Seeded ${customers.length} customers`);
}
