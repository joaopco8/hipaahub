const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dir = path.join(root, 'content', 'blog');

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));

let changedFiles = 0;

for (const file of files) {
  const fullPath = path.join(dir, file);
  let text = fs.readFileSync(fullPath, 'utf8');

  // Find end of frontmatter (second ---)
  let frontmatterEnd = -1;
  let dashCount = 0;
  const lines = text.split('\n');
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 2) {
        // position right after this line + newline
        frontmatterEnd = offset + lines[i].length + 1;
        break;
      }
    }
    offset += lines[i].length + 1;
  }

  if (frontmatterEnd === -1) {
    // No frontmatter, process whole file
    frontmatterEnd = 0;
  }

  const before = text.slice(0, frontmatterEnd);
  const after = text.slice(frontmatterEnd);

  // Only in MDX body, convert JSX-style description props
  const newAfter = after.replace(/description: "/g, 'description="');

  if (newAfter !== after) {
    fs.writeFileSync(fullPath, before + newAfter, 'utf8');
    changedFiles++;
    console.log(`Fixed description props in ${file}`);
  }
}

console.log(`\nDone. Updated ${changedFiles} MDX files.`);

