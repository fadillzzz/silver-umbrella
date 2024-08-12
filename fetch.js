#!/usr/bin/env node
const puppeteer = require("puppeteer");
const { isValidUrl, fetchPage, printMetadata } = require("./lib");
const args = process.argv;

if (args.length < 3) {
  console.log(`Usage: node fetch.js [--metadata] url [url ...]`);
  process.exit(1);
}

// Removes the binary and script name from the arguments since we don't care about them
args.shift();
args.shift();

let metadata = false;

if (args[0] === "--metadata") {
  metadata = true;
  args.shift();
}

const urls = [];

for (const arg of args) {
  if (isValidUrl(arg)) {
    urls.push(arg);
  } else {
    console.warn(`Invalid URL: ${arg}. Ignoring...`);
  }
}

// Nothing to do. Exiting early...
if (urls.length === 0) {
  console.error(`No valid URLs supplied. Exiting...`);
  process.exit(1);
}

(async function (urls) {
  const browser = await puppeteer.launch();
  const func = metadata ? printMetadata : fetchPage;
  const fetchers = urls.map((url) => func(browser, url));

  await Promise.all(fetchers);

  await browser.close();
  process.exit(0);
})(urls);
