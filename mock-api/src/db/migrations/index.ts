import { Knex } from 'knex';

export async function setupSchema(db: Knex) {
  // Create products table
  if (!(await db.schema.hasTable('products'))) {
    await db.schema.createTable('products', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.decimal('price', 10, 2).notNullable();
      table.integer('stock').defaultTo(0);
      table.string('category');
      table.string('sku').notNullable();
      table.string('imageUrl');
      table.json('attributes');
    });
  }

  // Create categories table
  if (!(await db.schema.hasTable('categories'))) {
    await db.schema.createTable('categories', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.string('parentId').references('id').inTable('categories');
    });
  }

  // Create customers table
  if (!(await db.schema.hasTable('customers'))) {
    await db.schema.createTable('customers', (table) => {
      table.string('id').primary();
      table.string('firstName').notNullable();
      table.string('lastName').notNullable();
      table.string('email').notNullable().unique();
      table.string('phone');
      table.integer('loyaltyPoints').defaultTo(0);
      table.timestamp('lastVisit');
    });
  }

  // Create orders table
  if (!(await db.schema.hasTable('orders'))) {
    await db.schema.createTable('orders', (table) => {
      table.string('id').primary();
      table.decimal('totalAmount', 10, 2).notNullable();
      table.enum('status', ['pending', 'completed', 'cancelled', 'refunded']).defaultTo('pending');
      table.timestamp('timestamp').defaultTo(db.fn.now());
      table.string('customerId').references('id').inTable('customers');
      table.enum('paymentMethod', ['cash', 'credit', 'bluetooth']).notNullable();
      table.string('receiptNumber');
    });
  }

  // Create order items table
  if (!(await db.schema.hasTable('order_items'))) {
    await db.schema.createTable('order_items', (table) => {
      table.increments('id').primary();
      table.string('orderId').references('id').inTable('orders').onDelete('CASCADE');
      table.string('productId').references('id').inTable('products');
      table.string('name').notNullable();
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2).notNullable();
    });
  }
}
