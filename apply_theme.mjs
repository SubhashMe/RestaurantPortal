import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/app/page.tsx',
  'src/app/login/page.tsx',
  'src/app/layout.tsx'
];

const colorMap = {
  // Backgrounds
  'bg-[#0f1115]': 'bg-[#1a0f14]', // Deep Rosewine
  'bg-[#181a1f]': 'bg-[#25141e]', // Card Rosewine
  'bg-[#22252b]': 'bg-[#331c29]',
  'bg-[#2c3038]': 'bg-[#402334]',
  'bg-black': 'bg-[#120a0e]',
  
  // Borders
  'border-[#22252b]': 'border-[#331c29]',
  'border-[#2c3038]': 'border-[#402334]',
  'border-[#363b45]': 'border-[#4d2a3e]',
  'border-amber-900/50': 'border-[#61364e]/50',
  'border-amber-500': 'border-[#D29B8C]',
  
  // Primary Color (Amber -> Rosegold)
  'bg-amber-900/20': 'bg-[#61364e]/20',
  'bg-amber-900/40': 'bg-[#61364e]/40',
  'bg-gradient-to-r from-amber-500 to-amber-600': 'bg-gradient-to-r from-[#D29B8C] to-[#B76E79]',
  'hover:from-amber-600 hover:to-amber-700': 'hover:from-[#B76E79] hover:to-[#9c5963]',
  'text-amber-500': 'text-[#D29B8C]',
  'text-amber-400': 'text-[#E5B6A8]',
  'text-amber-300': 'text-rose-300',
  'text-amber-50': 'text-rose-50',
  
  'ring-amber-500': 'ring-[#D29B8C]',
  'focus:ring-amber-500': 'focus:ring-[#D29B8C]',
  'focus:border-amber-500': 'focus:border-[#D29B8C]',
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
