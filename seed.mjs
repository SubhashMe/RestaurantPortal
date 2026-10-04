import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqklemshwcsavwdtnyhf.supabase.co';
const supabaseKey = 'sb_publishable_9GLl8pN5Mom7QnD_S-xZng_XIfQLSmd';
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Artisanal Starters' },
  { name: "Chef's Signature Mains" },
  { name: 'Exquisite Seafood' },
  { name: 'Decadent Desserts' },
  { name: 'Premium Beverages' }
];

async function seed() {
  console.log('Inserting categories...');
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .insert(categories)
    .select();

  if (catError) {
    console.error('Error inserting categories. DID YOU CREATE THE TABLES IN SUPABASE YET? Error:', catError);
    return;
  }

  console.log('Categories inserted successfully!', catData);

  // Map category names to IDs
  const catMap = {};
  catData.forEach(c => { catMap[c.name] = c.id; });

  const menuItems = [
    { name: 'Truffle Mushroom Velouté', description: 'A rich, creamy wild mushroom soup infused with white truffle oil and served with artisan sourdough.', price: 18.50, is_veg: true, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600', category_id: catMap['Artisanal Starters'] },
    { name: 'Pan-Seared Hokkaido Scallops', description: 'Hand-dived scallops with a cauliflower purée, caviar, and a delicate saffron butter sauce.', price: 28.00, is_veg: false, image_url: 'https://images.unsplash.com/photo-1626779836932-6a75f1d4bf59?q=80&w=600', category_id: catMap['Artisanal Starters'] },
    { name: 'Burrata & Heritage Tomato', description: 'Fresh Italian burrata, heirloom tomatoes, aged balsamic caviar, and basil emulsion.', price: 22.00, is_veg: true, image_url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600', category_id: catMap['Artisanal Starters'] },
    
    { name: 'Herb-Crusted Rack of Lamb', description: 'New Zealand lamb rack roasted to perfection, served with minted pea purée and a rich rosemary jus.', price: 48.00, is_veg: false, image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600', category_id: catMap["Chef's Signature Mains"] },
    { name: 'Free-Range Duck Breast', description: 'Pan-roasted duck breast with a spiced plum glaze, confit potatoes, and seasonal baby root vegetables.', price: 42.50, is_veg: false, image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600', category_id: catMap["Chef's Signature Mains"] },
    { name: 'Saffron & Gold Leaf Risotto', description: 'Acquerello rice simmered in a fragrant saffron broth, topped with edible 24k gold leaf and aged Parmigiano-Reggiano.', price: 38.00, is_veg: true, image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db378?q=80&w=600', category_id: catMap["Chef's Signature Mains"] },

    { name: 'Chilean Sea Bass', description: 'Miso-glazed sea bass, pan-seared and served over a bed of edamame purée and pickled ginger foam.', price: 52.00, is_veg: false, image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600', category_id: catMap['Exquisite Seafood'] },
    { name: 'Butter-Poached Lobster Tail', description: 'Maine lobster tail gently poached in clarified herb butter, accompanied by asparagus risotto.', price: 65.00, is_veg: false, image_url: 'https://images.unsplash.com/photo-1553659971-f01207815844?q=80&w=600', category_id: catMap['Exquisite Seafood'] },

    { name: 'Madagascar Vanilla Bean Panna Cotta', description: 'Silky Italian cream set with vanilla bean, served with a wild mixed berry compote and micro-mint.', price: 16.00, is_veg: true, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600', category_id: catMap['Decadent Desserts'] },
    { name: 'Valrhona Chocolate Fondant', description: 'Warm dark chocolate lava cake served with artisanal pistachio gelato and gold leaf.', price: 18.50, is_veg: true, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600', category_id: catMap['Decadent Desserts'] },

    { name: 'Sparkling Rose Water Lemonade', description: 'Freshly squeezed lemons infused with pure Damask rose water and topped with sparkling spring water.', price: 12.00, is_veg: true, image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600', category_id: catMap['Premium Beverages'] },
    { name: 'Smoked Rosemary Old Fashioned (Mocktail)', description: 'A non-alcoholic blend of charred oak syrup, bitters, and fresh orange peel, smoked with rosemary.', price: 15.00, is_veg: true, image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=600', category_id: catMap['Premium Beverages'] }
  ];

  console.log('Inserting menu items...');
  const { data: menuData, error: menuError } = await supabase
    .from('menu_items')
    .insert(menuItems)
    .select();

  if (menuError) {
    console.error('Error inserting menu items:', menuError);
    return;
  }

  console.log('Menu items inserted successfully!');
}

seed().catch(console.error);
