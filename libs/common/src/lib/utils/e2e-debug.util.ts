import * as fs from 'fs';
import * as path from 'path';

export function writeDataToFile(filePath: string, data: unknown) {
  // console.log({ 'process.env.NODE_ENV': process.env.NODE_ENV });
  // console.log({ 'process.env.TEST_TYPE': process.env.TEST_TYPE });
  if (process.env.NODE_ENV === 'test') {
    const fullPath = `apps/customer-api-e2e/debugs/${filePath}`;
    const dirPath = path.dirname(fullPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    if (process.env.TEST_TYPE === 'unit') {
      try {
        fs.appendFileSync(fullPath, JSON.stringify(data, null, 2));
        console.log(`Data written to file '${fullPath}'`);
      } catch (err) {
        console.error('Error writing to file:', err);
      }
    } else {
      fs.appendFile(fullPath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          console.error('Error writing to file:', err);
        } else {
          console.log(`Data written to file '${fullPath}'`);
        }
      });
    }
  }
}
