#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Function to recursively find all TypeScript files
function findTsFiles(dir, files = []) {
  const dirFiles = fs.readdirSync(dir);

  for (const file of dirFiles) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      findTsFiles(fullPath, files);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Replace the import statement
    content = content.replace(
      /import\s*{\s*IpcClient\s*}\s*from\s*["']@\/ipc\/ipc_client["'];?/g,
      'import { IpcClient } from "@/lib/universal-ipc";',
    );

    // If the file was changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const srcDir = path.join(__dirname, "..", "src");
const tsFiles = findTsFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files`);
console.log("Updating IpcClient imports...\n");

let updatedCount = 0;

for (const file of tsFiles) {
  if (updateImportsInFile(file)) {
    updatedCount++;
  }
}

console.log(`\n✅ Updated ${updatedCount} files`);
console.log("Import replacement complete!");
