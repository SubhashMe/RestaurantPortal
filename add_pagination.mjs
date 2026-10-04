import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add State Variables
const stateHookAnchor = "const [searchQuery, setSearchQuery] = useState(\"\");";
if (!content.includes("const [menuLimit, setMenuLimit]")) {
  const stateVars = `
  const [menuLimit, setMenuLimit] = useState(12);
  const [adminOrdersLimit, setAdminOrdersLimit] = useState(10);
  const [customerOrdersLimit, setCustomerOrdersLimit] = useState(10);
  const [bookingsLimit, setBookingsLimit] = useState(10);
  const [inquiriesLimit, setInquiriesLimit] = useState(10);
  const [usersLimit, setUsersLimit] = useState(10);
  `;
  content = content.replace(stateHookAnchor, stateHookAnchor + '\n' + stateVars);
}

// 2. Update fetchMenu
content = content.replace(
  "const { data: items } = await supabase.from('menu_items').select('*');",
  "const { data: items } = await supabase.from('menu_items').select('*').limit(menuLimit);"
);
content = content.replace(
  "  }, []);",
  "  }, [menuLimit]); // Updated for pagination"
);

// 3. Update Dashboard fetches
content = content.replace(
  "const { data: bookings } = await supabase.from('table_bookings').select('*').order('created_at', { ascending: false });",
  "const { data: bookings } = await supabase.from('table_bookings').select('*').order('created_at', { ascending: false }).limit(bookingsLimit);"
);
content = content.replace(
  "const { data: inquiries } = await supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false });",
  "const { data: inquiries } = await supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(inquiriesLimit);"
);
content = content.replace(
  "const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });",
  "const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(adminOrdersLimit);"
);
content = content.replace(
  "  }, [activeMenu, userRole]);",
  "  }, [activeMenu, userRole, adminOrdersLimit, bookingsLimit, inquiriesLimit, usersLimit]); // Updated for pagination"
);

// 4. Update My Orders fetch
content = content.replace(
  ".order('created_at', { ascending: false });",
  ".order('created_at', { ascending: false })\n          .limit(customerOrdersLimit);"
);
content = content.replace(
  "  }, [activeMenu, currentUser?.email]);",
  "  }, [activeMenu, currentUser?.email, customerOrdersLimit]); // Updated for pagination"
);

// We need to inject "Load More" buttons in the UI.

// 5. Menu Items Load More
const menuGridAnchor = `{filteredMenuItems.length === 0 ? (`;
const menuLoadMore = `
            {filteredMenuItems.length >= menuLimit && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setMenuLimit(prev => prev + 12)} className="px-6 py-2 bg-[#2c3038] hover:bg-[#363b45] text-amber-400 rounded-full font-medium transition-colors border border-[#363b45]">
                  Load More Items
                </button>
              </div>
            )}
`;
// We will insert it after the grid
content = content.replace(
  "            {filteredMenuItems.length === 0 ? (",
  menuLoadMore + "\n            {filteredMenuItems.length === 0 ? ("
);

// Wait, actually it's better to put Load More AFTER the grid.
// Let's find the end of the menu grid.
// It's easier to just use string replacements if we are careful, or we can use replace_file_content tool after this for UI.

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated page.tsx with data limits.");
