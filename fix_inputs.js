const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace any missing bg- class on inputs
code = code.replace(/<(input|select)([^>]*)className=\"([^\"]*)\"/g, (match, tag, before, className) => {
  if (!className.includes('bg-')) {
    return `<${tag}${before}className="${className} bg-[#0f1115] text-slate-200"`;
  }
  return match;
});

fs.writeFileSync('src/app/page.tsx', code);
console.log('Done!');
