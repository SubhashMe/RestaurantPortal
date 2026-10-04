import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/app/page.tsx',
  'src/app/login/page.tsx',
  'src/app/layout.tsx'
];

const colorMap = {
  // Backgrounds
  'bg-[#fff0f3]': 'bg-[#0f1115]',
  'bg-[#ffffff]': 'bg-[#181a1f]',
  'bg-[#ffe0e6]': 'bg-[#22252b]',
  'bg-[#ffcdd6]': 'bg-[#2c3038]',
  'bg-[#fff5f7]': 'bg-black',
  
  // Borders
  'border-[#ffe0e6]': 'border-[#22252b]',
  'border-[#ffcdd6]': 'border-[#2c3038]',
  'border-[#ffb3c1]': 'border-[#363b45]',
  'border-[#ff8fa3]/50': 'border-amber-900/50',
  'border-[#cc0033]': 'border-amber-500',
  
  // Accents & Gradients
  'bg-[#cc0033]/10': 'bg-amber-900/20',
  'bg-[#cc0033]/20': 'bg-amber-900/40',
  'bg-gradient-to-r from-[#cc0033] to-[#990022]': 'bg-gradient-to-r from-amber-500 to-amber-600',
  'hover:from-[#b3002d] hover:to-[#80001c]': 'hover:from-amber-600 hover:to-amber-700',
  
  // Text Colors
  'text-[#cc0033]': 'text-amber-500',
  'text-[#990022]': 'text-amber-400',
  'text-[#a30029]': 'text-amber-300',
  'text-[#33000b]': 'text-amber-50', 
  'text-[#590016]': 'text-slate-200',
  'text-[#800020]': 'text-slate-300',
  'text-[#991a36]': 'text-slate-400',
  'text-[#b3334d]': 'text-slate-500',
  
  // Rings
  'ring-[#cc0033]': 'ring-amber-500',
  'focus:ring-[#cc0033]': 'focus:ring-amber-500',
  'focus:border-[#cc0033]': 'focus:border-amber-500',
};

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const [oldClass, newClass] of Object.entries(colorMap)) {
      const escapedOld = oldClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?<=[\\s"'\\\`])` + escapedOld + `(?=[\\s"'\\\`])`, 'g');
      content = content.replace(regex, newClass);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
