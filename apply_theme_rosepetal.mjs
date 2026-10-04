import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/app/page.tsx',
  'src/app/login/page.tsx',
  'src/app/layout.tsx'
];

const colorMap = {
  // Backgrounds
  'bg-[#1a0f14]': 'bg-[#fff0f3]', // Body background -> Soft pastel pink
  'bg-[#25141e]': 'bg-[#ffffff]', // Card background -> White
  'bg-[#331c29]': 'bg-[#ffe0e6]',
  'bg-[#402334]': 'bg-[#ffcdd6]',
  'bg-[#120a0e]': 'bg-[#fff5f7]',
  
  // Borders
  'border-[#331c29]': 'border-[#ffe0e6]',
  'border-[#402334]': 'border-[#ffcdd6]',
  'border-[#4d2a3e]': 'border-[#ffb3c1]',
  'border-[#61364e]/50': 'border-[#ff8fa3]/50',
  'border-[#D29B8C]': 'border-[#cc0033]',
  
  // Accents & Gradients (Crimson)
  'bg-[#61364e]/20': 'bg-[#cc0033]/10',
  'bg-[#61364e]/40': 'bg-[#cc0033]/20',
  'bg-gradient-to-r from-[#D29B8C] to-[#B76E79]': 'bg-gradient-to-r from-[#cc0033] to-[#990022]',
  'hover:from-[#B76E79] hover:to-[#9c5963]': 'hover:from-[#b3002d] hover:to-[#80001c]',
  
  // Text Colors
  'text-[#D29B8C]': 'text-[#cc0033]',
  'text-[#E5B6A8]': 'text-[#990022]',
  'text-rose-300': 'text-[#a30029]',
  'text-rose-50': 'text-[#33000b]', 
  'text-slate-200': 'text-[#590016]',
  'text-slate-300': 'text-[#800020]',
  'text-slate-400': 'text-[#991a36]',
  'text-slate-500': 'text-[#b3334d]',
  
  // Rings
  'ring-[#D29B8C]': 'ring-[#cc0033]',
  'focus:ring-[#D29B8C]': 'focus:ring-[#cc0033]',
  'focus:border-[#D29B8C]': 'focus:border-[#cc0033]',
};

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Process replacements
    for (const [oldClass, newClass] of Object.entries(colorMap)) {
      const escapedOld = oldClass.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?<=[\\s"'\\\`])` + escapedOld + `(?=[\\s"'\\\`])`, 'g');
      content = content.replace(regex, newClass);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
