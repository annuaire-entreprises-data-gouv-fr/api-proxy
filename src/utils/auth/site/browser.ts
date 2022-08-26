// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';

// add stealth plugin and use defaults (all evasion techniques)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

let instance = null as Browser | null;

const getBrowserInstance = async () => {
  if (!instance) instance = await puppeteer.launch({ headless: true });
  return instance;
};

export default getBrowserInstance;
