/* eslint-disable */
import { execSync } from 'child_process';
import { execAndWait } from './test-utils';

module.exports = async function () {
  // Stop the test database using Docker Compose.
  console.log('\nTearing down...\n');

  try {
    // Stop ngrok
    execSync('npm run e2e:ngrok:stop');
    // Stop the application
    execAndWait('npm run e2e:stop', { stdio: 'inherit' });
    // Stop the test database using Docker
    execAndWait('npm run e2e:db:down');
  } catch (error) {
    console.error('Error while tearing down:', error);
  }

  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
