#!/usr/bin/env node

/**
 * For a set of '.json' files compatible with app-localize (or other systems) containing
 * translations, rewrites them to '.js' files compatible with the Localize System of Lion.
 * As an argument, you need to provide '--path' or '-P'.
 * From this path the script will look for all json files (also in nested folders).
 */

const minimist = require('minimist'); // eslint-disable-line import/no-extraneous-dependencies
const fs = require('fs');
const path = require('path');

const argv = minimist(process.argv.slice(2));
const config = {
  extension: '.json',
  excludeFiles: [],
  excludeFolders: ['node_modules', '.history'], // blacklist

  /**
   * CLI
   * - Example:
   *   `./scripts/convert-translations.js --path $(pwd)/translations --cleanup
   *    --whitelist '["openDatepickerLabel"]' --dry`
   */
  path: argv.path || argv.P,
  cleanup: argv.cleanup,
  dry: argv.dry,
  whiteListFilterKeys: argv.whitelist && JSON.parse(argv.whitelist),
};

if (!config.path) {
  // eslint-disable-next-line no-console
  console.warn('Please provide a starting path via "--path /my/path/to/translations"');
  process.exit(1);
}

const localesSupported = {
  bg: ['BG'],
  cs: ['CZ'],
  de: ['DE'],
  en: ['AU', 'GB', 'US'],
  es: ['ES'],
  fr: ['BE', 'FR'],
  hu: ['HU'],
  it: ['IT'],
  nl: ['NL', 'BE'],
  pl: ['PL'],
  ro: ['RO'],
  ru: ['RU'],
  sk: ['SK'],
  uk: ['UA'],
};

/**
 * Gets an array of files for given extension
 * @param {string} startPath - local filesystem path
 * @param {object} cfg - configuration object
 * @param {string} cfg.extension - file extension like '.json'
 * @param {array} cfg.excludeFiles - file names filtered out
 * @param {array} cfg.excludeFolders - folder names filtered out
 * @param {array} cfg.allowedParentFolders -
 * @param {array} result - list of file paths
 * @returns {array} result list of file paths
 */
function gatherFilesFromDir(startPath, cfg = config, result = []) {
  const files = fs.readdirSync(startPath);
  files.forEach(file => {
    const filePath = path.join(startPath, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      const folderName = filePath.replace(/.*\/([^/]+)$/, '$1');
      if (!cfg.excludeFolders.includes(folderName)) {
        gatherFilesFromDir(filePath, cfg, result); // search recursively
      }
    } else if (filePath.endsWith(cfg.extension)) {
      const fileName = filePath.replace(/.*\/([^/]+)$/, '$1');
      if (!cfg.excludeFiles.includes(fileName)) {
        result.push(filePath);
      }
    }
  });
  return result;
}

/**
 * Rewrites all relative links of markdown content to absolute links.
 * Also includes images. See: https://github.com/tcort/markdown-link-extractor/blob/master/index.js
 * @param {string} fileContent - contents of .json file to parse
 * @returns {string} adjusted contents of input md file (mdContent)
 */
function rewriteTranslationFile(fileContent) {
  const whitelist = config.whiteListFilterKeys;
  /**
   *
   * @param {Object} obj - parsed JSON
   * @param {String} res - string result
   * @param {Number} lvl - determins indent
   * @returns {String} - reformatted JSON input, aligned with Lion Localize System
   */
  function printJsonLevel(obj, res = '', lvl = 0) {
    const tab = '  ';
    let r = res;
    const indent = tab.repeat(lvl);

    r += `${indent}{\n`;

    Object.entries(obj).forEach(([k, v]) => {
      const indent2 = tab.repeat(lvl + 1);

      if (typeof k === 'string') {
        // Keys should not contain quotes, values should contain single quotes
        // TODO: maybe add a check for non camelCased keys, if needed
        if (!whitelist || whitelist.includes(k)) {
          const escapedValue = v.replace("'", "\\'");
          r += `${indent2}${k}: '${escapedValue}',\n`;
        }
      } else if (typeof v === 'object') {
        r = printJsonLevel(v, r, lvl + 1);
      }
    });

    r += `${indent}}\n`;

    return r;
  }

  let result = '';

  // 1. Make it compatible with our linting rules
  // console.log(fileContent);
  const parsed = JSON.parse(fileContent);
  result += printJsonLevel(parsed);

  // 2. Add 'export default '
  result = `export default ${result}`;

  return result;
}

function getDerivedLocaleFiles(isoLang) {
  const /** @type {Array} */ result = [];
  const /** @type {Array} */ localesForLang = localesSupported[isoLang];

  if (!localesForLang) return undefined;

  localesForLang.forEach(locale => {
    const derivedFile = `import ${isoLang} from './${isoLang}.js';

export default {
  ...${isoLang},
};
`;

    result.push({ derivedFileName: `${isoLang}-${locale}.js`, derivedContent: derivedFile });
  });

  return result;
}

function writeResults(derivedLocaleFiles, filePath, rewrittenContent, { dryRun }) {
  const results = [];
  // These are contents of original file
  results.push({ pathToWrite: filePath.replace('.json', '.js'), newContent: rewrittenContent });

  // These are derived contents
  const fileFolder = path.dirname(filePath);
  derivedLocaleFiles.forEach(({ derivedFileName, derivedContent }) => {
    results.push({ pathToWrite: `${fileFolder}/${derivedFileName}`, newContent: derivedContent });
  });

  if (dryRun) {
    results.forEach(({ pathToWrite, newContent }) => {
      console.log(`== output for filePath '${pathToWrite}' ===`); // eslint-disable-line no-console
      console.log(newContent); // eslint-disable-line no-console
    });
  } else {
    results.forEach(({ pathToWrite, newContent }) => {
      fs.writeFileSync(pathToWrite, newContent);
    });
  }
}

/**
 * Main code
 */
function main({ dryRun, cleanup } = { dryRun: false, cleanup: false }) {
  const jsonFilePaths = gatherFilesFromDir(config.path);
  jsonFilePaths.forEach(filePath => {
    // 1. Get contents
    const content = fs.readFileSync(filePath).toString();
    const rewrittenContent = rewriteTranslationFile(content, filePath);

    // 2. Add all dialects/locales supported on top
    const fileName = filePath.replace(/^.*[\\\/]/, ''); // eslint-disable-line
    const isoLang = fileName.replace('.json', '');
    const derivedLocaleFiles = getDerivedLocaleFiles(isoLang);
    if (!derivedLocaleFiles) return;

    // 3. Write the results
    writeResults(derivedLocaleFiles, filePath, rewrittenContent, { dryRun });

    // 4 Cleanup
    if (cleanup && !dryRun) {
      fs.unlinkSync(filePath);
    }
  });
}

module.exports = main;

main({ dryRun: config.dry, cleanup: config.cleanup });
