/* Migration script to update next-auth to v5 syntax */
const fs = require('fs');
const path = require('path');

function walk(dir, call) {
  for (let f of fs.readdirSync(dir)) {
    let full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full, call);
    } else {
      call(full);
    }
  }
}

walk(path.join(__dirname, 'app'), (file) => {
  if (file.endsWith('.js') || file.endsWith('.ts')) {
    let code = fs.readFileSync(file, 'utf8');
    let original = code;

    // Remove import { getServerSession }
    code = code.replace(/import\s*{\s*getServerSession\s*}\s*from\s*["']next-auth["'];?\n?/g, '');
    
    // Replace import { authOptions } with import { auth }
    code = code.replace(/import\s*{\s*authOptions\s*}\s*from/g, 'import { auth } from');
    
    // Replace await getServerSession(authOptions) with await auth()
    code = code.replace(/await\s+getServerSession\(\s*authOptions\s*\)/g, 'await auth()');

    if (code !== original) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Updated', file);
    }
  }
});
