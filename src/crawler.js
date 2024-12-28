import puppeteer from "puppeteer";
import { domains, productUrlPatterns, crawlSettings } from "./config.js";
import { isProductUrl, isSameDomain, saveOutput } from "./utils.js";

const crawlDomain = async (browser, domain, productPatterns) => {
  console.log(`Starting crawl for: ${domain}`);
  const results = new Set();

  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (["image", "font"].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    const baseUrl = `https://www.${domain}`;
    await page.goto(baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: crawlSettings.timeout,
    });

    const links = await page.$$eval("a", (anchors) =>
      anchors.map((a) => a.href).filter((href) => href.startsWith("http"))
    );

    for (const link of links) {
      if (isProductUrl(link, productPatterns) && isSameDomain(link, domain)) {
        results.add(link);
      }
    }
  } catch (error) {
    console.error(`Error crawling ${domain}:`, error);
  } finally {
    await page.close();
  }

  return Array.from(results);
};

const main = async () => {
  const browser = await puppeteer.launch({ headless: true });
  const results = {};

  try {
    for (const domain of domains) {
      results[`https://${domain}`] = await crawlDomain(
        browser,
        domain,
        productUrlPatterns
      );
    }

    await saveOutput(results, "./output/product-urls.json");
  } catch (error) {
    console.error("Error during crawling:", error);
  } finally {
    await browser.close();
  }
};

main();
