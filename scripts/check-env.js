const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const examplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.error('.env file not found!');
  process.exit(1);
}

if (!fs.existsSync(examplePath)) {
  console.error('.env.example file not found!');
  process.exit(1);
}

const parseEnv = (content) => {
  return content
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key] = line.split('=');
      if (key) acc.add(key.trim());
      return acc;
    }, new Set());
};

const envVars = parseEnv(fs.readFileSync(envPath, 'utf8'));
const exampleVars = parseEnv(fs.readFileSync(examplePath, 'utf8'));

console.log('\nEnvironment Variable Check');
console.log('==========================');
console.log(`${'Variable'.padEnd(30)} | ${'Status'}`);
console.log(`${'-'.repeat(30)} | ${'-'.repeat(10)}`);

exampleVars.forEach(v => {
  const status = envVars.has(v) ? '✅ SET' : '❌ MISSING';
  console.log(`${v.padEnd(30)} | ${status}`);
});

console.log('\n');
