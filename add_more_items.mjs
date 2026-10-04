import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqklemshwcsavwdtnyhf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9GLl8pN5Mom7QnD_S-xZng_XIfQLSmd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addMoreItems() {
  console.log("Fetching categories...");
  
  const { data: categories, error } = await supabase.from('categories').select('id, name');
  if (error) {
    console.error("Error fetching categories:", error);
    return;
  }

  const categoryMap = {};
  categories.forEach(c => categoryMap[c.name] = c.id);

  const newItems = [];

  // 1. Decadent Desserts
  if (categoryMap['Decadent Desserts']) {
    newItems.push({
      name: 'Classic Tiramisu',
      description: 'Authentic Italian espresso-soaked ladyfingers layered with rich mascarpone cream and dusted with premium cocoa.',
      price: 14.50,
      is_veg: true,
      image_url: 'https://images.unsplash.com/photo-1571115177098-24c428d2279b?q=80&w=600',
      category_id: categoryMap['Decadent Desserts']
    });
  }

  // 2. Premium Beverages
  if (categoryMap['Premium Beverages']) {
    newItems.push({
      name: 'Artisanal Matcha Latte',
      description: 'Ceremonial grade Japanese matcha whisked with steamed almond milk and a hint of vanilla bean syrup.',
      price: 8.50,
      is_veg: true,
      image_url: 'https://images.unsplash.com/photo-1536622244977-28fb7b22a6b2?q=80&w=600',
      category_id: categoryMap['Premium Beverages']
    });
  }

  // 3. Exquisite Seafood
  if (categoryMap['Exquisite Seafood']) {
    newItems.push({
      name: 'Grilled King Prawns',
      description: 'Jumbo king prawns char-grilled with garlic butter, fresh parsley, and a squeeze of charred lemon.',
      price: 45.00,
      is_veg: false,
      image_url: 'https://images.unsplash.com/photo-1559742811-822873691fc8?q=80&w=600',
      category_id: categoryMap['Exquisite Seafood']
    });
  }

  if (newItems.length > 0) {
    console.log("Inserting new items...");
    const { error: insertError } = await supabase.from('menu_items').insert(newItems);
    
    if (insertError) {
      console.error("Error inserting items:", insertError);
    } else {
      console.log(`Successfully added ${newItems.length} items!`);
    }
  } else {
    console.log("No categories found to add items to.");
  }
}

addMoreItems();
