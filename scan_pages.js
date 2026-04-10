
const fs = require('fs');
const path = require('path');

const pagesDir = 'c:\\NextProjects\\Khansaheb\\pages';
const componentDir = 'c:\\NextProjects\\Khansaheb\\component';

// Helper to get all files recursively
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(filePath));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

// Helper to extract imports from a file
function getImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports = new Set();
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const componentName = match[1];
        const importPath = match[2];
        // We are interested in components imported from the component directory
        if (importPath.includes('component/') || importPath.includes('../component') || importPath.includes('../../component')) {
            imports.add(componentName);
        }
    }
    return Array.from(imports);
}

// Get all page files
const pageFiles = getFiles(pagesDir);
const allUsedComponents = new Set();

pageFiles.forEach(file => {
    // Skip api, _app, _document
    if (file.includes('api\\') || file.includes('_app.js') || file.includes('_document.js')) return;
    
    const imports = getImports(file);
    imports.forEach(comp => allUsedComponents.add(comp));
});

// console.log("Used Components in Pages:");
// console.log(JSON.stringify(Array.from(allUsedComponents).sort(), null, 2));
