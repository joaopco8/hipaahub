const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../content/blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));

let fixed = 0;
const validDates = [
  '2026-01-15', '2026-01-16', '2026-01-17', '2026-01-18', '2026-01-19',
  '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23', '2026-01-24',
  '2026-01-25', '2026-01-26', '2026-01-27', '2026-01-28', '2026-01-29',
  '2026-01-30', '2026-01-31', '2026-02-01', '2026-02-02', '2026-02-03',
  '2026-02-04', '2026-02-05', '2026-02-06', '2026-02-07', '2026-02-08',
  '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13',
  '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18',
  '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
  '2026-02-24', '2026-02-25', '2026-02-26', '2026-02-27', '2026-02-28',
  '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05',
  '2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10',
  '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15'
];

let dateIndex = 0;

files.forEach(file => {
  const fullPath = path.join(blogDir, file);
  let text = fs.readFileSync(fullPath, 'utf8');
  
  // Find date in frontmatter
  const dateMatch = text.match(/^date: "(\d{4}-\d{2}-\d{2})"/m);
  if (dateMatch) {
    const dateStr = dateMatch[1];
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Validate date
    const date = new Date(year, month - 1, day);
    const isValid = date.getFullYear() === year && 
                    date.getMonth() === month - 1 && 
                    date.getDate() === day;
    
    if (!isValid || month === 2 && day > 28) {
      // Use a valid date from our list
      const newDateStr = validDates[dateIndex % validDates.length];
      dateIndex++;
      
      // Replace in frontmatter
      text = text.replace(/^date: "\d{4}-\d{2}-\d{2}"/m, `date: "${newDateStr}"`);
      
      // Also replace in ArticleSchema if present
      text = text.replace(/datePublished="\d{4}-\d{2}-\d{2}"/g, `datePublished="${newDateStr}"`);
      
      fs.writeFileSync(fullPath, text, 'utf8');
      console.log(`✅ Fixed ${file}: ${dateStr} -> ${newDateStr}`);
      fixed++;
    }
  }
});

console.log(`\n✨ Fixed ${fixed} files with invalid dates.`);
