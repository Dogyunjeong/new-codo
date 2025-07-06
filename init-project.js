#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project name from command line arguments
const newProjectName = process.argv[2];

if (!newProjectName) {
  console.error('❌ Error: Please provide a project name');
  console.log('Usage: npm run init <project-name>');
  console.log('Example: npm run init my-awesome-app');
  process.exit(1);
}

// Validate project name
if (!/^[a-z0-9-]+$/.test(newProjectName)) {
  console.error('❌ Error: Project name must contain only lowercase letters, numbers, and hyphens');
  process.exit(1);
}

console.log(
  `🚀 Changing @base/ and base-project to @${newProjectName}/ and ${newProjectName} in all project files including lock files`,
);

// Function to recursively find all project files
function findProjectFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .git, and other build directories
    if (
      entry.isDirectory() &&
      !['node_modules', '.git', '.yarn', 'dist', 'build', 'logs'].includes(entry.name)
    ) {
      findProjectFiles(fullPath, files);
    }
    // Include TypeScript/JavaScript project files and lock files (but skip init-project.js)
    else if (
      entry.isFile() &&
      ['.json', '.mts', '.ts', '.js', '.jsx', '.tsx'].includes(path.extname(entry.name)) &&
      entry.name !== 'init-project.js'
    ) {
      files.push(fullPath);
    }
    // Include lock files
    else if (entry.isFile() && ['yarn.lock', 'package-lock.json'].includes(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to change @base/ and base-project patterns
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Check if file contains @base/ or base-project
    if (!content.includes('@base/') && !content.includes('base-project')) {
      return false;
    }

    // Replace @base/ with @newProjectName/ (including in regex patterns)
    if (content.includes('@base/')) {
      // Replace @base/ in regular text
      content = content.replace(/@base\//g, `@${newProjectName}/`);
      // Replace /@base\/ in regex patterns (like /@base\/.+$/)
      content = content.replace(/\/@base\\\//g, `/@${newProjectName}\\/`);
      updated = true;
    }

    // Replace base-project patterns (as word, prefix, or suffix)
    if (content.includes('base-project')) {
      // As standalone word
      content = content.replace(/\bbase-project\b/g, newProjectName);
      // As prefix (base-project-something)
      content = content.replace(/\bbase-project-/g, `${newProjectName}-`);
      // As suffix (something-base-project)
      content = content.replace(/-base-project\b/g, `-${newProjectName}`);
      updated = true;
    }


    if (!updated) {
      return false;
    }

    // Write back to file
    fs.writeFileSync(filePath, content);

    console.log(`✅ Updated ${path.relative(__dirname, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${path.relative(__dirname, filePath)}:`, error.message);
    return false;
  }
}

// Main execution
console.log('\n📄 Finding all project files...');
const projectFiles = findProjectFiles(__dirname);
console.log(`Found ${projectFiles.length} files to check`);

console.log('\n🔄 Updating @base/ and base-project references...');
let updatedCount = 0;

projectFiles.forEach((filePath) => {
  if (updateFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n🎉 Complete! Updated ${updatedCount} files`);
console.log(`📦 All @base/ and base-project references changed to @${newProjectName}/ and ${newProjectName}`);

if (updatedCount > 0) {
  console.log('\n📋 Next steps:');
  console.log('1. Run: yarn install');
  console.log('2. Verify changes look correct');
}
