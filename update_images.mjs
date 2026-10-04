import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eqklemshwcsavwdtnyhf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_9GLl8pN5Mom7QnD_S-xZng_XIfQLSmd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateImages() {
  console.log("Updating broken images...");
  
  // Update Pan-Seared Hokkaido Scallops
  const { error: err1 } = await supabase
    .from('menu_items')
    .update({ image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=600' })
    .eq('name', 'Pan-Seared Hokkaido Scallops');

  if (err1) console.error("Error updating Scallops:", err1);
  else console.log("Updated Scallops image!");

  // Update Saffron & Gold Leaf Risotto
  const { error: err2 } = await supabase
    .from('menu_items')
    .update({ image_url: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=600' })
    .eq('name', 'Saffron & Gold Leaf Risotto');

  if (err2) console.error("Error updating Risotto:", err2);
  else console.log("Updated Risotto image!");
}

updateImages();
