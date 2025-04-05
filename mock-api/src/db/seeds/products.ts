import { Product } from '../../models';

export const products: Product[] = [
  // COFFEE CATEGORY
  {
    id: '1',
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through ground coffee beans',
    price: 3.50,
    stock: 100,
    category: 'coffee',
    sku: 'COFFEE-001',
    imageUrl: '/images/products/coffee/espresso_1.jpg',
    attributes: {
      size: 'small',
      caffeine: 'high',
      origin: 'Colombia'
    }
  },
  
  // ID 2: Cappuccino
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    price: 4.25,
    stock: 75,
    category: 'coffee',
    sku: 'COFFEE-002',
    imageUrl: '/images/products/coffee/cappuccino_2.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'Brazil'
    }
  },
  
  // ID 3: Latte - Better latte with latte art
  {
    id: '3',
    name: 'Latte',
    description: 'Espresso with steamed milk and a small amount of foam',
    price: 4.50,
    stock: 80,
    category: 'coffee',
    sku: 'COFFEE-003',
    imageUrl: '/images/products/coffee/latte_3.jpg',
    attributes: {
      size: 'large',
      caffeine: 'medium',
      origin: 'Ethiopia'
    }
  },
  {
    id: '4',
    name: 'Americano',
    description: 'Espresso diluted with hot water',
    price: 3.75,
    stock: 90,
    category: 'coffee',
    sku: 'COFFEE-004',
    imageUrl: '/images/products/coffee/americano_4.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'Colombia'
    }
  },
  {
    id: '5',
    name: 'Mocha',
    description: 'Espresso with chocolate and steamed milk',
    price: 4.75,
    stock: 65,
    category: 'coffee',
    sku: 'COFFEE-005',
    imageUrl: '/images/products/coffee/mocha_5.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'Brazil'
    }
  },
  {
    id: '6',
    name: 'Cold Brew',
    description: 'Coffee brewed with cold water over an extended period',
    price: 4.25,
    stock: 60,
    category: 'coffee',
    sku: 'COFFEE-006',
    imageUrl: '/images/products/coffee/cold_brew_6.jpg',
    attributes: {
      size: 'large',
      caffeine: 'high',
      origin: 'Guatemala'
    }
  },
  
  // TEA CATEGORY
  {
    id: '7',
    name: 'Chai Tea Latte',
    description: 'Spiced black tea with steamed milk',
    price: 4.50,
    stock: 80,
    category: 'tea',
    sku: 'TEA-001',
    imageUrl: '/images/products/tea/chai_tea_latte_7.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'India'
    }
  },
  {
    id: '8',
    name: 'Green Tea',
    description: 'Traditional Japanese green tea with antioxidants',
    price: 3.80,
    stock: 75,
    category: 'tea',
    sku: 'TEA-002',
    imageUrl: '/images/products/tea/green_tea_8.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'low',
      origin: 'Japan'
    }
  },
  {
    id: '9',
    name: 'Earl Grey',
    description: 'Black tea flavored with bergamot oil',
    price: 3.50,
    stock: 85,
    category: 'tea',
    sku: 'TEA-003',
    imageUrl: '/images/products/tea/earl_grey_9.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'UK'
    }
  },  
  {
    id: '10',
    name: 'Chamomile Tea',
    description: 'Herbal infusion with calming properties',
    price: 3.25,
    stock: 70,
    category: 'tea',
    sku: 'TEA-004',
    imageUrl: '/images/products/tea/chamomile_tea_10.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'none',
      origin: 'Egypt'
    }
  },
  {
    id: '11',
    name: 'Matcha Latte',
    description: 'Japanese green tea powder with steamed milk',
    price: 4.75,
    stock: 60,
    category: 'tea',
    sku: 'TEA-005',
    imageUrl: '/images/products/tea/matcha_latte_11.jpg',
    attributes: {
      size: 'medium',
      caffeine: 'medium',
      origin: 'Japan'
    }
  },
  
  // PASTRY CATEGORY
  {
    id: '12',
    name: 'Croissant',
    description: 'Buttery, flaky French pastry',
    price: 2.95,
    stock: 30,
    category: 'pastry',
    sku: 'PASTRY-001',
    imageUrl: '/images/products/pastry/croissant_12.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy'
    }
  },
  {
    id: '13',
    name: 'Chocolate Muffin',
    description: 'Rich chocolate muffin with chocolate chips',
    price: 3.25,
    stock: 25,
    category: 'pastry',
    sku: 'PASTRY-002',
    imageUrl: '/images/products/pastry/chocolate_muffin_13.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '14',
    name: 'Almond Danish',
    description: 'Flaky pastry filled with almond paste',
    price: 3.50,
    stock: 20,
    category: 'pastry',
    sku: 'PASTRY-003',
    imageUrl: '/images/products/pastry/almond_danish_14.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, nuts'
    }
  },
  {
    id: '15',
    name: 'Cinnamon Roll',
    description: 'Sweet roll with cinnamon and frosting',
    price: 3.75,
    stock: 22,
    category: 'pastry',
    sku: 'PASTRY-004',
    imageUrl: '/images/products/pastry/cinnamon_roll_15.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy'
    }
  },
  {
    id: '16',
    name: 'Blueberry Scone',
    description: 'Buttery scone with fresh blueberries',
    price: 3.25,
    stock: 18,
    category: 'pastry',
    sku: 'PASTRY-005',
    imageUrl: '/images/products/pastry/blueberry_scone_16.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy'
    }
  },
  
  // BREAKFAST CATEGORY
  {
    id: '17',
    name: 'Avocado Toast',
    description: 'Fresh avocado on artisanal sourdough bread',
    price: 8.95,
    stock: 15,
    category: 'breakfast',
    sku: 'BREAKFAST-001',
    imageUrl: '/images/products/breakfast/avocado_toast_17.jpg',
    attributes: {
      diet: 'vegan',
      allergens: 'gluten'
    }
  },
  {
    id: '18',
    name: 'Breakfast Burrito',
    description: 'Scrambled eggs, cheese, potatoes, and salsa in a tortilla',
    price: 9.50,
    stock: 12,
    category: 'breakfast',
    sku: 'BREAKFAST-002',
    imageUrl: '/images/products/breakfast/breakfast_burrito_18.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '19',
    name: 'Eggs Benedict',
    description: 'Poached eggs, ham, and hollandaise on an English muffin',
    price: 10.95,
    stock: 10,
    category: 'breakfast',
    sku: 'BREAKFAST-003',
    imageUrl: '/images/products/breakfast/eggs_benedict_19.jpg',
    attributes: {
      diet: 'omnivore',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '20',
    name: 'Greek Yogurt Parfait',
    description: 'Greek yogurt with fresh berries and granola',
    price: 6.95,
    stock: 18,
    category: 'breakfast',
    sku: 'BREAKFAST-004',
    imageUrl: '/images/products/breakfast/greek_yogurt_parfait_20.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'dairy, nuts'
    }
  },
  {
    id: '21',
    name: 'Breakfast Sandwich',
    description: 'Fried egg, cheese, and bacon on a toasted bagel',
    price: 7.95,
    stock: 15,
    category: 'breakfast',
    sku: 'BREAKFAST-005',
    imageUrl: '/images/products/breakfast/breakfast_sandwich_21.jpg',
    attributes: {
      diet: 'omnivore',
      allergens: 'gluten, dairy, eggs'
    }
  },
  
  // SANDWICH CATEGORY (NEW)
  {
    id: '22',
    name: 'Turkey Club',
    description: 'Sliced turkey, bacon, lettuce, and tomato on toasted bread',
    price: 9.95,
    stock: 18,
    category: 'sandwich',
    sku: 'SANDWICH-001',
    imageUrl: '/images/products/sandwich/turkey_club_22.jpg',
    attributes: {
      diet: 'omnivore',
      allergens: 'gluten, dairy'
    }
  },
  {
    id: '23',
    name: 'Caprese Sandwich',
    description: 'Fresh mozzarella, tomato, and basil with balsamic glaze',
    price: 8.95,
    stock: 16,
    category: 'sandwich',
    sku: 'SANDWICH-002',
    imageUrl: '/images/products/sandwich/caprese_sandwich_23.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy'
    }
  },
  {
    id: '24',
    name: 'Grilled Cheese',
    description: 'Melted cheddar and swiss on buttered sourdough bread',
    price: 7.50,
    stock: 20,
    category: 'sandwich',
    sku: 'SANDWICH-003',
    imageUrl: '/images/products/sandwich/grilled_cheese_24.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy'
    }
  },
  {
    id: '25',
    name: 'Chicken Pesto Panini',
    description: 'Grilled chicken with pesto, provolone, and roasted red peppers',
    price: 10.50,
    stock: 14,
    category: 'sandwich',
    sku: 'SANDWICH-004',
    imageUrl: '/images/products/sandwich/chicken_pesto_panini_25.jpg',
    attributes: {
      diet: 'omnivore',
      allergens: 'gluten, dairy, nuts'
    }
  },
  
  // SALAD CATEGORY (NEW)
  {
    id: '26',
    name: 'Caesar Salad',
    description: 'Romaine lettuce with Caesar dressing, parmesan, and croutons',
    price: 8.95,
    stock: 12,
    category: 'salad',
    sku: 'SALAD-001',
    imageUrl: '/images/products/salad/caesar_salad_26.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '27',
    name: 'Greek Salad',
    description: 'Mixed greens with feta, olives, cucumbers, and red onions',
    price: 9.50,
    stock: 10,
    category: 'salad',
    sku: 'SALAD-002',
    imageUrl: '/images/products/salad/greek_salad_27.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'dairy'
    }
  },
  {
    id: '28',
    name: 'Cobb Salad',
    description: 'Chopped salad with chicken, bacon, blue cheese, and hard-boiled egg',
    price: 11.95,
    stock: 8,
    category: 'salad',
    sku: 'SALAD-003',
    imageUrl: '/images/products/salad/cobb_salad_28.jpg',
    attributes: {
      diet: 'omnivore',
      allergens: 'dairy, eggs'
    }
  },
  
  // DESSERT CATEGORY (NEW)
  {
    id: '29',
    name: 'Chocolate Chip Cookie',
    description: 'Fresh-baked cookie with semi-sweet chocolate chunks',
    price: 2.50,
    stock: 30,
    category: 'dessert',
    sku: 'DESSERT-001',
    imageUrl: '/images/products/dessert/chocolate_chip_cookie_29.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '30',
    name: 'New York Cheesecake',
    description: 'Creamy cheesecake with graham cracker crust',
    price: 5.95,
    stock: 16,
    category: 'dessert',
    sku: 'DESSERT-002',
    imageUrl: '/images/products/dessert/new_york_cheesecake_30.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '31',
    name: 'Tiramisu',
    description: 'Italian dessert with layers of coffee-soaked ladyfingers and mascarpone',
    price: 6.50,
    stock: 12,
    category: 'dessert',
    sku: 'DESSERT-003',
    imageUrl: '/images/products/dessert/tiramisu_31.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  },
  {
    id: '32',
    name: 'Fruit Tart',
    description: 'Buttery crust filled with custard and topped with fresh fruits',
    price: 5.75,
    stock: 14,
    category: 'dessert',
    sku: 'DESSERT-004',
    imageUrl: '/images/products/dessert/fruit_tart_32.jpg',
    attributes: {
      diet: 'vegetarian',
      allergens: 'gluten, dairy, eggs'
    }
  }
];
