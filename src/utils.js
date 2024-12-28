import fs from "fs-extra";

export const isProductUrl = (url, patterns) => {
  return patterns.some((pattern) => url.includes(pattern));
};

export const isSameDomain = (url, domain) => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname === domain || hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
};

export const saveOutput = async (data, filePath) => {
  try {
    await fs.ensureDir(filePath.substring(0, filePath.lastIndexOf("/")));
    await fs.writeJson(filePath, data, { spaces: 2 });
    console.log(`Output saved to ${filePath}`);
  } catch (error) {
    console.error("Error saving output:", error);
  }
};
