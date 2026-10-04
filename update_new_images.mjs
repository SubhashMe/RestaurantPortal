import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqklemshwcsavwdtnyhf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9GLl8pN5Mom7QnD_S-xZng_XIfQLSmd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImages() {
  console.log("Updating broken images...");
  
  const updates = [
    { name: 'Classic Tiramisu', url: 'https://picsum.photos/id/431/600/400' },
    { name: 'Artisanal Matcha Latte', url: 'https://picsum.photos/id/42/600/400' },
    { name: 'Grilled King Prawns', url: 'https://picsum.photos/id/292/600/400' }
  ];

  for (const item of updates) {
    const { error } = await supabase
      .from('menu_items')
      .update({ image_url: item.url })
      .eq('name', item.name);

    if (error) console.error(`Error updating ${item.name}:`, error);
    else console.log(`Updated ${item.name} image!`);
  }
}

updateImages();
