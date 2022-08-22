import puppeteer from 'puppeteer';

let instance = null as puppeteer.Browser | null;

const getBrowserInstance = async () => {
  if (!instance) instance = await puppeteer.launch();
  return instance;
};

export default getBrowserInstance;
