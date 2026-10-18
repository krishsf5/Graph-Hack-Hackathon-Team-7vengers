import fs from 'fs';
import path from 'path';
import * as parser from '@babel/parser';
import traversePkg from '@babel/traverse';
import { getGraph } from '../config/falkordb.js';

const traverse = traversePkg.default || traversePkg;

/**
 * Scans a local directory, parses JS/TS files with Babel AST,
 * and builds a SourceFile -> IMPORTS -> SourceFile and
 * SourceFile -> DEFINES -> CodeSymbol graph directly inside FalkorDB.
 */
export async function ingestCodebase(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Directory does not exist: ${directoryPath}`);
  }

  const graph = await getGraph();
  const files = [];

  function collectFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
          collectFiles(fullPath);
        }
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  collectFiles(directoryPath);
  console.log(`[CodeIngest] Discovered ${files.length} code files in ${directoryPath}`);

  let ingestedFiles = 0;
  let ingestedSymbols = 0;
  let ingestedImports = 0;

  for (const filePath of files) {
    const relativePath = path.relative(directoryPath, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Create SourceFile node
    const fileCypher = `
      MERGE (f:SourceFile {path: $path})
      SET f.language = $lang, f.updatedAt = $updatedAt
    `;
    const lang = path.extname(filePath).replace('.', '') || 'js';
    const updatedAt = new Date().toISOString();
    await graph.query(fileCypher, { params: { path: relativePath, lang, updatedAt } });
    ingestedFiles++;

    // 2. Parse AST
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      // 3. Extract Imports
      traverse(ast, {
        ImportDeclaration({ node }) {
          const importSource = node.source.value;
          if (importSource.startsWith('.')) {
            // Relative import
            const resolvedPath = path.normalize(path.join(path.dirname(relativePath), importSource)).replace(/\\/g, '/');
            const importCypher = `
              MERGE (f1:SourceFile {path: $f1})
              MERGE (f2:SourceFile {path: $f2})
              MERGE (f1)-[:IMPORTS]->(f2)
            `;
            graph.query(importCypher, { params: { f1: relativePath, f2: resolvedPath } }).catch(() => {});
            ingestedImports++;
          }
        },

        // 4. Extract Functions / Classes
        FunctionDeclaration({ node }) {
          if (node.id && node.id.name) {
            const symName = node.id.name;
            const startLine = node.loc ? node.loc.start.line : 0;
            const endLine = node.loc ? node.loc.end.line : 0;

            const symCypher = `
              MERGE (s:CodeSymbol {name: $name, file: $file})
              SET s.kind = 'function', s.startLine = $startLine, s.endLine = $endLine
              WITH s
              MATCH (f:SourceFile {path: $file})
              MERGE (f)-[:DEFINES]->(s)
            `;
            graph.query(symCypher, {
              params: { name: symName, file: relativePath, startLine, endLine }
            }).catch(() => {});
            ingestedSymbols++;
          }
        }
      });
    } catch (parseErr) {
      console.warn(`[CodeIngest] Skipping AST for ${relativePath}: ${parseErr.message}`);
    }
  }

  return {
    directoryPath,
    ingestedFiles,
    ingestedSymbols,
    ingestedImports
  };
}
