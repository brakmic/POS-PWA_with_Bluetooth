import { Product } from '../models';

export const products: Product[] = [
  {
    id: '1',
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through ground coffee beans',
    price: 3.50,
    stock: 100,
    category: 'coffee',
    sku: 'COFFEE-001',
    imageUrl: 'https://picsum.photos/id/431/300/200',
    attributes: {
      size: 'small',
      caffeine: 'high',
      origin: 'Colombia'
    }
  },
  {
    id: '2',
    name: 'Chai Tea Latte',
    description: 'Spiced black tea with steamed milk',
    price: 4.50,
    stock: 80,
    category: 'tea',
    sku: 'TEA-001',
    imageUrl: 'https://picsum.photos/id/225/300/200',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'India'
    }
  },
  {
    id: '3',
    name: 'Croissant',
    description: 'Buttery, flaky French pastry',
    price: 2.95,
    stock: 30,
    category: 'pastry',
    sku: 'PASTRY-001',
    imageUrl: 'https://picsum.photos/id/267/300/200',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy'
    }
  },
  {
    id: '4',
    name: 'Avocado Toast',
    description: 'Fresh avocado on artisanal sourdough bread',
    price: 8.95,
    stock: 15,
    category: 'breakfast',
    sku: 'BREAKFAST-001',
    imageUrl: 'https://picsum.photos/id/294/300/200',
    attributes: {
      diet: 'vegan',
      allergens: 'gluten'
    }
  },
  {
    id: '5',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    price: 4.25,
    stock: 75,
    category: 'coffee',
    sku: 'COFFEE-002',
    imageUrl: 'https://picsum.photos/id/425/300/200',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'Brazil'
    }
  }
];
