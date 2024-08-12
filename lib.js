const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * Validates a given URL
 * @param url URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Parses the URL and generates a filename
 * @param url URL to parse
 * @returns {string} Filename generated from the URL
 */
function getUrlFileName(url) {
  url = new URL(url);
  let name = url.hostname;

  if (url.pathname !== "/") {
    name += url.pathname.replace(/\//g, "_");
  }

  return `${path.join(__dirname, name)}.html`;
}

/**
 * Fetches a page and saves it to a file
 *
 * @param browser Instance of Puppeteer browser
 * @param url URL to fetch
 */
async function fetchPage(browser, url) {
  const page = await browser.newPage();

  console.info(`Fetching ${url}`);

  try {
    await page.goto(url);

    const data = await page.content();

    const fileName = getUrlFileName(url);

    await fs.writeFile(fileName, data);
  } catch (e) {
    console.error(
      `Unexpected error occurred while fetching ${url}: ${e.message}`
    );
  }
}

/**
 * Prints metadata of a given URL. Will implicitly fetch the page if it hasn't been fetched yet.
 * @param browser Instance of Puppeteer browser
 * @param url URL to print metadata for
 */
async function printMetadata(browser, url) {
  const fileName = getUrlFileName(url);

  console.info(`Printing metadata for ${url}`);

  try {
    await fs.access(fileName);
  } catch (e) {
    console.warn(
      `Local file for ${url} not found. Fetching the latest page...`
    );
    await fetchPage(browser, url);
  }

  try {
    const page = await browser.newPage();
    await page.goto(`file:${fileName}`);

    console.log(`site: ${url}`);

    const links = await page.$$eval("a", (elements) => elements.length);
    console.log(`num_links: ${links}`);

    const images = await page.$$eval("img", (elements) => elements.length);
    console.log(`images: ${images}`);

    const meta = await fs.stat(fileName);
    console.log(`last_fetch: ${meta.mtime}`);
  } catch (e) {
    console.error(
      `Unexpected error occurred while fetching metadata of ${url}: ${e.message}`
    );
  }
}

module.exports = {
  isValidUrl,
  fetchPage,
  printMetadata,
  getUrlFileName,
};
