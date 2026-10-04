const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add fetchAnnouncements useEffect
if (!code.includes('fetchAnnouncements')) {
  code = code.replace(
    'useEffect(() => {\n    async function fetchMenu() {',
    `useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (data) setAnnouncements(data);
    }
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    async function fetchMenu() {`
  );
}

// 2. Add UI for Announcements display (for customers)
// We can place it inside <main className="flex-1 pt-24 pb-12"> before the container
if (!code.includes('active-announcements-banner')) {
  code = code.replace(
    '<main className="flex-1 pt-24 pb-12">',
    `<main className="flex-1 pt-24 pb-12">
        {/* Active Announcements Banner */}
        {announcements.filter(a => a.is_active).length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 active-announcements-banner">
            {announcements.filter(a => a.is_active).map(ann => (
              <div key={ann.id} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4 flex items-start gap-3">
                <Bell className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-amber-500 font-semibold mb-1">Announcement</h3>
                  <p className="text-slate-300 whitespace-pre-wrap">{ann.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}`
  );
}

// 3. Add Admin UI for Announcements in Overview tab
const adminUI = `
                {/* Announcements Management Section */}
                <div className="bg-[#181a1f] p-6 rounded-xl border border-[#2c3038] mb-8">
                  <h2 className="text-xl font-bold text-[#f8fafc] mb-6 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    Manage Announcements
                  </h2>
                  
                  <div className="flex gap-4 mb-6">
                    <textarea 
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Type a new announcement or notification..."
                      className="flex-1 bg-[#0f1115] text-slate-200 border border-[#2c3038] rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button 
                      onClick={async () => {
                        if (!newAnnouncement.trim()) return;
                        const { data, error } = await supabase.from('announcements').insert([{ message: newAnnouncement.trim(), is_active: true }]).select();
                        if (data) {
                          setAnnouncements([data[0], ...announcements]);
                          setNewAnnouncement('');
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-[#0f1115] px-6 py-2 rounded-lg font-medium transition-colors h-fit whitespace-nowrap"
                    >
                      Post Announcement
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div key={ann.id} className="flex items-center justify-between p-4 bg-[#0f1115] rounded-lg border border-[#2c3038]">
                        <div className="flex-1 mr-4">
                          <p className="text-slate-300 mb-2">{ann.message}</p>
                          <span className="text-xs text-slate-500">
                            {new Date(ann.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={async () => {
                              const newStatus = !ann.is_active;
                              const { error } = await supabase.from('announcements').update({ is_active: newStatus }).eq('id', ann.id);
                              if (!error) {
                                setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, is_active: newStatus} : a));
                              }
                            }}
                            className={\`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
                              ann.is_active 
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
                                : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'
                            }\`}
                          >
                            {ann.is_active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={async () => {
                              const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
                              if (!error) {
                                setAnnouncements(announcements.filter(a => a.id !== ann.id));
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <p className="text-slate-500 text-center py-4">No announcements yet.</p>
                    )}
                  </div>
                </div>
`;

if (!code.includes('Manage Announcements')) {
  code = code.replace(
    '{/* Recent Orders Chart / Summary (Placeholder) */}',
    adminUI + '\n                {/* Recent Orders Chart / Summary (Placeholder) */}'
  );
}

fs.writeFileSync('src/app/page.tsx', code);
console.log('Successfully updated page.tsx with announcements UI!');
