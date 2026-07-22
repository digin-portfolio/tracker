import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = 'C:/Users/hhp/Desktop/TV TRACKER/outputs/tv-tracker-qa';
await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add('QA Dashboard');
const checklist = workbook.worksheets.add('Test Checklist');
const backlog = workbook.worksheets.add('Improvement Backlog');

const navy = '#0D253F';
const blue = '#01B4E4';
const paleBlue = '#E7F7FC';
const paleGray = '#F4F7F9';
const green = '#DCFCE7';
const red = '#FEE2E2';
const yellow = '#FEF3C7';
const border = '#D7E0E5';

const applyTitle = (sheet, range, text) => {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[text]];
  sheet.getRange(range).format = { fill: navy, font: { bold: true, color: '#FFFFFF', size: 18 }, horizontalAlignment: 'left', verticalAlignment: 'center' };
};
const applyHeader = (sheet, range) => {
  sheet.getRange(range).format = { fill: blue, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, borders: { preset: 'all', style: 'thin', color: border } };
};

dashboard.showGridLines = false;
applyTitle(dashboard, 'A1:H2', 'TV Tracker — Quality Check Dashboard');
dashboard.getRange('A3:H3').merge();
dashboard.getRange('A3').values = [['Use the Test Checklist while reviewing the website. Update Status and Notes; this page summarizes your progress.']];
dashboard.getRange('A3:H3').format = { fill: paleBlue, font: { color: navy }, wrapText: true, verticalAlignment: 'center' };

dashboard.getRange('A5:B5').merge(); dashboard.getRange('C5:D5').merge(); dashboard.getRange('E5:F5').merge(); dashboard.getRange('G5:H5').merge();
dashboard.getRange('A5').values = [['Passed']]; dashboard.getRange('C5').values = [['Failed']]; dashboard.getRange('E5').values = [['Not tested']]; dashboard.getRange('G5').values = [['Blocked']];
dashboard.getRange('A6:B7').merge(); dashboard.getRange('C6:D7').merge(); dashboard.getRange('E6:F7').merge(); dashboard.getRange('G6:H7').merge();
dashboard.getRange('A6').formulas = [["=COUNTIF('Test Checklist'!$F$5:$F$34,\"Pass\")"]];
dashboard.getRange('C6').formulas = [["=COUNTIF('Test Checklist'!$F$5:$F$34,\"Fail\")"]];
dashboard.getRange('E6').formulas = [["=COUNTIF('Test Checklist'!$F$5:$F$34,\"Not Tested\")"]];
dashboard.getRange('G6').formulas = [["=COUNTIF('Test Checklist'!$F$5:$F$34,\"Blocked\")"]];
for (const pair of ['A5:B5', 'C5:D5', 'E5:F5', 'G5:H5']) dashboard.getRange(pair).format = { fill: navy, font: { bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center' };
for (const pair of ['A6:B7', 'C6:D7', 'E6:F7', 'G6:H7']) dashboard.getRange(pair).format = { fill: paleGray, font: { bold: true, color: navy, size: 22 }, horizontalAlignment: 'center', verticalAlignment: 'center', borders: { preset: 'outside', style: 'thin', color: border } };

dashboard.getRange('A9:H9').merge(); dashboard.getRange('A9').values = [['Review flow']]; dashboard.getRange('A9:H9').format = { fill: navy, font: { bold: true, color: '#FFFFFF' } };
dashboard.getRange('A10:H14').values = [
  ['1', 'Open the local site', 'Start at Home and follow the test rows in order.', '', '', '', '', ''],
  ['2', 'Record a result', 'Choose Pass, Fail, Blocked, or Not Tested for each checklist row.', '', '', '', '', ''],
  ['3', 'Describe failures', 'Use Notes / Issue for what happened and Improvement Idea for the fix.', '', '', '', '', ''],
  ['4', 'Prioritize', 'Start with High-priority failures before visual polish or new features.', '', '', '', '', ''],
  ['5', 'Retest', 'After a fix, set the status to Pass and add the retest date.', '', '', '', '', '']
];
dashboard.getRange('A10:A14').format = { font: { bold: true, color: blue }, horizontalAlignment: 'center' };
dashboard.getRange('B10:B14').format = { font: { bold: true, color: navy } };
dashboard.getRange('C10:H14').merge(true);
dashboard.getRange('A10:H14').format.borders = { preset: 'insideHorizontal', style: 'thin', color: border };
dashboard.getRange('A1:H14').format.wrapText = true;
dashboard.getRange('A1:A14').format.columnWidth = 8;
dashboard.getRange('B1:B14').format.columnWidth = 24;
dashboard.getRange('C1:H14').format.columnWidth = 18;
dashboard.getRange('A1:H14').format.rowHeight = 22;
dashboard.getRange('A1:H2').format.rowHeight = 28;
dashboard.getRange('A3:H3').format.rowHeight = 32;

checklist.showGridLines = false;
applyTitle(checklist, 'A1:J2', 'TV Tracker — Website Testing Checklist');
checklist.getRange('A3:J3').merge();
checklist.getRange('A3').values = [['Test on desktop and phone. Set Status as you go; use Notes / Issue to record anything that needs fixing.']];
checklist.getRange('A3:J3').format = { fill: paleBlue, font: { color: navy }, wrapText: true };
const testHeaders = [['ID', 'Area', 'What to check', 'How to test', 'Expected result', 'Status', 'Priority', 'Notes / Issue', 'Improvement idea', 'Retest date']];
checklist.getRange('A4:J4').values = testHeaders;
applyHeader(checklist, 'A4:J4');
const tests = [
  ['T-01', 'Navigation', 'Landing page entry', 'Open the website at / and select the main call to action.', 'It opens the dashboard without errors.', 'Not Tested', 'High', '', '', ''],
  ['T-02', 'Navigation', 'Sidebar links', 'Open every visible sidebar item.', 'Every visible item opens a working page; no placeholder page appears.', 'Not Tested', 'High', '', '', ''],
  ['T-03', 'Dashboard', 'Live statistics', 'Mark a title and an episode as watched; return Home.', 'Watched titles, episodes, favorites, and estimated hours update.', 'Not Tested', 'High', '', '', ''],
  ['T-04', 'Dashboard', 'Continue Watching', 'Mark one or more episodes watched.', 'Recent items appear with correct title and season/episode detail.', 'Not Tested', 'High', '', '', ''],
  ['T-05', 'TMDB / Offline', 'No-key experience', 'Remove the local TMDB key in Settings and browse the app.', 'Fallback titles and their detail pages still work.', 'Not Tested', 'High', '', '', ''],
  ['T-06', 'TMDB', 'API connection', 'Connect a valid TMDB key in Settings.', 'The app confirms the connection and shows live content.', 'Not Tested', 'High', '', '', ''],
  ['T-07', 'Search', 'Search results', 'Search for a movie and a TV show from the top bar.', 'Relevant results appear and open the selected title page.', 'Not Tested', 'High', '', '', ''],
  ['T-08', 'Categories', 'Movie, TV, K-drama, Anime pages', 'Open each category page.', 'Each list loads and title cards are clickable.', 'Not Tested', 'Medium', '', '', ''],
  ['T-09', 'Title page', 'Title details', 'Open a movie and a TV show.', 'Title, metadata, synopsis, rating controls, and images display cleanly.', 'Not Tested', 'High', '', '', ''],
  ['T-10', 'Title page', 'Trailer modal', 'Open Watch Trailer, then close it.', 'The modal opens when a trailer exists and the page remains usable after closing.', 'Not Tested', 'Medium', '', '', ''],
  ['T-11', 'Tracking', 'Mark title watched', 'Toggle Mark Watched twice.', 'State changes correctly and the title appears/disappears from history.', 'Not Tested', 'High', '', '', ''],
  ['T-12', 'Tracking', 'Episode progress', 'Toggle two episodes watched, refresh, then untoggle one.', 'Episode state survives refresh and dashboard progress is correct.', 'Not Tested', 'High', '', '', ''],
  ['T-13', 'Favorites', 'Add and remove favorites', 'Favorite a title; open Favorites; remove it.', 'The list updates immediately and after refresh.', 'Not Tested', 'High', '', '', ''],
  ['T-14', 'Ratings', 'Save title rating', 'Rate a title, refresh, then revisit it.', 'Your score is retained and shown on the title page.', 'Not Tested', 'High', '', '', ''],
  ['T-15', 'Reviews', 'Save personal review', 'Post a review with a score; refresh.', 'Review text, score, and date remain visible.', 'Not Tested', 'High', '', '', ''],
  ['T-16', 'Ratings library', 'Ratings & Reviews page', 'Open Ratings from the sidebar.', 'Rated/reviewed titles show correct scores, counts, and links.', 'Not Tested', 'High', '', '', ''],
  ['T-17', 'History', 'Watch History page', 'Open View History from the dashboard.', 'Items are newest first and open their title page.', 'Not Tested', 'High', '', '', ''],
  ['T-18', 'Collections', 'Create and edit collection', 'Create a list, change its name/privacy, refresh.', 'Changes are saved and visible after refresh.', 'Not Tested', 'High', '', '', ''],
  ['T-19', 'Collections', 'Add item from title page', 'Use Add to List on a title page.', 'Correct title, year, type, and poster are added to the chosen list.', 'Not Tested', 'High', '', '', ''],
  ['T-20', 'Collections', 'Add/remove manual item', 'Add an item manually, then remove it.', 'The list updates immediately and remains correct after refresh.', 'Not Tested', 'Medium', '', '', ''],
  ['T-21', 'Settings', 'Profile name', 'Change display name and save.', 'Dashboard greeting and new review name use the saved name.', 'Not Tested', 'Medium', '', '', ''],
  ['T-22', 'Settings', 'Theme', 'Switch Light/Dark and refresh.', 'The chosen theme remains active and text stays readable.', 'Not Tested', 'High', '', '', ''],
  ['T-23', 'Settings', 'Clear local data', 'Use Clear local data only after testing other rows.', 'Confirmation appears; app data clears and the app still works.', 'Not Tested', 'High', '', '', ''],
  ['T-24', 'Mobile', 'Sidebar and top bar', 'Test at 375 px width or on a phone.', 'Navigation is usable, no overlap occurs, and controls can be tapped.', 'Not Tested', 'High', '', '', ''],
  ['T-25', 'Mobile', 'Title page layout', 'Open a title page on a phone-sized screen.', 'Poster, action buttons, season list, and review area fit without clipping.', 'Not Tested', 'High', '', '', ''],
  ['T-26', 'Accessibility', 'Keyboard use', 'Use Tab / Enter through top navigation and title actions.', 'Visible focus, logical order, and all important actions can be reached.', 'Not Tested', 'Medium', '', '', ''],
  ['T-27', 'Accessibility', 'Images and contrast', 'Review images, labels, and dark mode.', 'Images have useful alt text and text remains readable.', 'Not Tested', 'Medium', '', '', ''],
  ['T-28', 'Reliability', 'Invalid/missing content', 'Open a bad title URL and disconnect the API.', 'A clear recovery message and a way back are shown.', 'Not Tested', 'Medium', '', '', ''],
  ['T-29', 'Performance', 'Initial load and scrolling', 'Reload on normal and slow network; scroll long pages.', 'No major delays, broken images, or noticeable interface freezes.', 'Not Tested', 'Medium', '', '', ''],
  ['T-30', 'Release', 'Production build', 'Run npm run build before deployment.', 'Build finishes with no errors or lint warnings.', 'Not Tested', 'High', '', '', '']
];
checklist.getRange(`A5:J${4 + tests.length}`).values = tests;
checklist.getRange(`A5:J${4 + tests.length}`).format = { verticalAlignment: 'top', wrapText: true, borders: { preset: 'insideHorizontal', style: 'thin', color: border } };
checklist.getRange(`F5:F${4 + tests.length}`).dataValidation = { rule: { type: 'list', values: ['Not Tested', 'Pass', 'Fail', 'Blocked'] } };
checklist.getRange(`G5:G${4 + tests.length}`).dataValidation = { rule: { type: 'list', values: ['High', 'Medium', 'Low'] } };
checklist.getRange(`J5:J${4 + tests.length}`).format.numberFormat = 'yyyy-mm-dd';
checklist.getRange(`F5:F${4 + tests.length}`).conditionalFormats.add('cellIs', { operator: 'equal', formula: '"Pass"', format: { fill: green, font: { color: '#166534', bold: true } } });
checklist.getRange(`F5:F${4 + tests.length}`).conditionalFormats.add('cellIs', { operator: 'equal', formula: '"Fail"', format: { fill: red, font: { color: '#991B1B', bold: true } } });
checklist.getRange(`F5:F${4 + tests.length}`).conditionalFormats.add('cellIs', { operator: 'equal', formula: '"Blocked"', format: { fill: yellow, font: { color: '#92400E', bold: true } } });
checklist.freezePanes.freezeRows(4);
['A','B','C','D','E','F','G','H','I','J'].forEach((col, idx) => { checklist.getRange(`${col}:${col}`).format.columnWidth = [10,16,26,32,32,14,11,28,28,14][idx]; });
checklist.getRange(`A5:J${4 + tests.length}`).format.rowHeight = 64;
checklist.getRange('A4:J4').format.rowHeight = 32;
checklist.getRange('A1:J2').format.rowHeight = 28;
checklist.getRange('A3:J3').format.rowHeight = 30;

backlog.showGridLines = false;
applyTitle(backlog, 'A1:H2', 'TV Tracker — Improvement Backlog');
backlog.getRange('A3:H3').merge();
backlog.getRange('A3').values = [['Use this page after testing to turn findings into a prioritized improvement plan. Add your own ideas below the starter items.']];
backlog.getRange('A3:H3').format = { fill: paleBlue, font: { color: navy }, wrapText: true };
backlog.getRange('A4:H4').values = [['ID', 'Improvement', 'Why it matters', 'Priority', 'Effort', 'Status', 'Owner', 'Notes']];
applyHeader(backlog, 'A4:H4');
const ideas = [
  ['I-01', 'Mobile navigation polish', 'Makes the app comfortable to use on phones and tablets.', 'High', 'Medium', 'Planned', '', 'Collapsible sidebar; larger touch targets.'],
  ['I-02', 'Calendar page', 'Helps users see upcoming episodes and releases.', 'High', 'Medium', 'Planned', '', 'Use TMDB air dates.'],
  ['I-03', 'Statistics page', 'Turns existing tracking data into useful insights.', 'High', 'Medium', 'Planned', '', 'Charts for titles, episodes, favorites, and hours.'],
  ['I-04', 'Automated tests', 'Protects watched, rating, history, and collection logic from regressions.', 'High', 'Medium', 'Planned', '', 'Start with browser-storage helpers.'],
  ['I-05', 'Cloud accounts and sync', 'Lets people keep their data across browsers and devices.', 'High', 'High', 'Backlog', '', 'Requires authentication and backend.'],
  ['I-06', 'Backend TMDB proxy', 'Avoids exposing a browser API key and enables caching.', 'High', 'Medium', 'Backlog', '', 'Use serverless functions or API server.'],
  ['I-07', 'Watch statuses', 'Improves tracking beyond watched/not watched.', 'Medium', 'Medium', 'Backlog', '', 'Plan to watch, watching, completed, on hold, dropped.'],
  ['I-08', 'Recommendations and filters', 'Makes discovery more useful as library data grows.', 'Medium', 'High', 'Backlog', '', 'Genre, year, language, provider, rating.'],
  ['I-09', 'Notifications', 'Brings users back for upcoming episodes and releases.', 'Medium', 'High', 'Backlog', '', 'Browser or email reminders.'],
  ['I-10', 'PWA support', 'Makes the project installable and more app-like.', 'Low', 'Medium', 'Backlog', '', 'Install prompt and offline shell.']
];
backlog.getRange(`A5:H${4 + ideas.length}`).values = ideas;
backlog.getRange(`A5:H${4 + ideas.length}`).format = { verticalAlignment: 'top', wrapText: true, borders: { preset: 'insideHorizontal', style: 'thin', color: border } };
backlog.getRange(`D5:D${4 + ideas.length}`).dataValidation = { rule: { type: 'list', values: ['High', 'Medium', 'Low'] } };
backlog.getRange(`E5:E${4 + ideas.length}`).dataValidation = { rule: { type: 'list', values: ['Low', 'Medium', 'High'] } };
backlog.getRange(`F5:F${4 + ideas.length}`).dataValidation = { rule: { type: 'list', values: ['Planned', 'In Progress', 'Done', 'Backlog'] } };
backlog.getRange(`D5:D${4 + ideas.length}`).conditionalFormats.add('cellIs', { operator: 'equal', formula: '"High"', format: { fill: red, font: { color: '#991B1B', bold: true } } });
backlog.freezePanes.freezeRows(4);
['A','B','C','D','E','F','G','H'].forEach((col, idx) => { backlog.getRange(`${col}:${col}`).format.columnWidth = [10,28,40,12,12,15,16,32][idx]; });
backlog.getRange(`A5:H${4 + ideas.length}`).format.rowHeight = 48;
backlog.getRange('A4:H4').format.rowHeight = 32;
backlog.getRange('A1:H2').format.rowHeight = 28;
backlog.getRange('A3:H3').format.rowHeight = 30;

const inspect = await workbook.inspect({ kind: 'table', range: 'Test Checklist!A1:J12', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 10 });
console.log(inspect.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 100 }, summary: 'formula error scan' });
console.log(errors.ndjson);
const preview = await workbook.render({ sheetName: 'Test Checklist', range: 'A1:J14', scale: 1.2, format: 'png' });
await fs.writeFile(`${outputDir}/test-checklist-preview.png`, new Uint8Array(await preview.arrayBuffer()));
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(`${outputDir}/TV-Tracker-QA-Checklist.xlsx`);
