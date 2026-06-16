import fs from 'node:fs'
import path from 'node:path'

export default function AutoImportComponents() {
  const registry: Record<string, string> = {};
  const componentsDir = path.resolve(process.cwd(), 'src/components');

  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(/@customElement\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
          registry[match[1]] = `/src/components/${file}`;
        }
      }
    }
  }

  return {
    name: 'auto-import-components',
    transform(code: string, id: string) {
      if (!id.includes('/src/') || (!id.endsWith('.ts') && !id.endsWith('.js'))) {
        return null;
      }

      let importsToAdd = '';

      for (const [tag, path] of Object.entries(registry)) {
        if (id.endsWith(path)) {
          continue;
        }

        const hasTag = new RegExp(`\\b${tag}\\b`).test(code);
        const alreadyImported = code.includes(path);

        if (hasTag && !alreadyImported) {
          importsToAdd += `import '${path}';\n`;
        }
      }

      if (importsToAdd) {
        return {
          code: importsToAdd + code,
          map: null
        };
      }

      return null;
    }
  };
}