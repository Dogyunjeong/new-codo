import fs from 'fs';
import path from 'path';

interface SaveFileOptions<T extends unknown> {
  data: T;
  filePath: string;
  fileName: string;
  format?: 'json' | 'text';
}

export const saveFile = async <T extends unknown>({
  data,
  filePath,
  fileName,
  format = 'json',
}: SaveFileOptions<T>): Promise<void> => {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    const fullPath = path.join(filePath, fileName);

    // Convert data based on format
    const contentToWrite = format === 'json' ? JSON.stringify(data, null, 2) : String(data);

    // Save file
    await fs.promises.writeFile(fullPath, contentToWrite, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save file: ${error}`);
  }
};
