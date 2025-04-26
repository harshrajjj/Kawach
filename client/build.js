// build.js - Custom build script for Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log the Node.js version
console.log(`Node.js version: ${process.version}`);

// Log the current directory
console.log(`Current directory: ${process.cwd()}`);

// Run the build command
console.log('Running build command...');
execSync('npm run build', { stdio: 'inherit' });

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist after build');
  process.exit(1);
}

// Copy the _redirects file to the dist directory if it exists
const redirectsSource = path.join(__dirname, 'public', '_redirects');
const redirectsDest = path.join(distDir, '_redirects');

if (fs.existsSync(redirectsSource)) {
  fs.copyFileSync(redirectsSource, redirectsDest);
  console.log('Copied _redirects file to dist directory');
}

// Copy vercel.json to the dist directory if it exists
const vercelSource = path.join(__dirname, 'vercel.json');
const vercelDest = path.join(distDir, 'vercel.json');

if (fs.existsSync(vercelSource)) {
  fs.copyFileSync(vercelSource, vercelDest);
  console.log('Copied vercel.json file to dist directory');
}

console.log('Build completed successfully');
