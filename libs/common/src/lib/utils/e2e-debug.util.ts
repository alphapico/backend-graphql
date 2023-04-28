import * as fs from 'fs';
import * as path from 'path';

export function writeDataToFile(filePath: string, data: unknown) {
  if (process.env.NODE_ENV === 'test') {
    const fullPath = `apps/customer-api-e2e/debugs/${filePath}`;
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.appendFile(fullPath, JSON.stringify(data, null, 2), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log(`Data written to file '${fullPath}'`);
      }
    });
  }
}
