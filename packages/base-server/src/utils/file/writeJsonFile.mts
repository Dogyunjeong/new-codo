import fs from 'node:fs';
import path from 'node:path';

/**
 * Writes data to a JSON file, creating directories if they don't exist
 * @param filePath - Path to the file to write
 * @param data - Data to write to the file
 */
const writeJsonFile = (filePath: string, data: any): void => {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export default writeJsonFile;
