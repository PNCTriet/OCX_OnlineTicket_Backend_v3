const fs = require('fs');
const path = require('path');

// Copy template files to dist folder
function copyTemplates() {
  const srcDir = path.join(__dirname, 'src', 'email', 'template');
  const distDir = path.join(__dirname, 'dist', 'src', 'email', 'template');
  
  // Create dist directory if it doesn't exist
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copy all files from src to dist
  if (fs.existsSync(srcDir)) {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
      const srcPath = path.join(srcDir, file);
      const distPath = path.join(distDir, file);
      fs.copyFileSync(srcPath, distPath);
      console.log(`✅ Copied ${file} to dist folder`);
    });
  }
  
  console.log('🎨 Templates copied successfully!');
}

copyTemplates(); 