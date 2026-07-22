import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const outputDir = 'C:/Users/hhp/Desktop/TV TRACKER/outputs/tv-tracker-qa';
const file = await FileBlob.load(`${outputDir}/TV-Tracker-QA-Checklist.xlsx`);
const workbook = await SpreadsheetFile.importXlsx(file);
for (const [sheetName, range, name] of [
  ['QA Dashboard', 'A1:H14', 'dashboard-preview.png'],
  ['Improvement Backlog', 'A1:H14', 'backlog-preview.png']
]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.2, format: 'png' });
  await fs.writeFile(`${outputDir}/${name}`, new Uint8Array(await preview.arrayBuffer()));
}
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 100 }, summary: 'final formula error scan' });
console.log(errors.ndjson);
