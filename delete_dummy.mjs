const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function deleteData(table) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=not.is.null`, {
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (res.ok) {
    console.log(`${table} cleared.`);
  } else {
    console.error(`Error clearing ${table}:`, await res.text());
  }
}

async function main() {
  await deleteData('table_bookings');
  await deleteData('contact_inquiries');
  await deleteData('users');
  console.log("Done.");
}

main();
