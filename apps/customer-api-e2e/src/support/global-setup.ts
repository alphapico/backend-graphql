import { execSync } from 'child_process';
import {
  execAndWait,
  waitForHealthyDBService,
  waitForAPIReady,
} from './test-utils';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');
  try {
    // Start the test database using Docker Compose.
    await execAndWait('npm run e2e:db:up');

    // Wait for the database service to be healthy. test_db is the name of the service name in docker-compose.e2e.yml
    await waitForHealthyDBService('test_db');

    // Deploy the schema using Prisma migrations.
    execSync('npm run e2e:db:deploy');

    // Start the application
    await execAndWait('npm run e2e:start', { stdio: 'inherit' });

    // Wait for the server to be ready
    // await sleep(5000);
    await waitForAPIReady();
  } catch (error) {
    console.error('Error while setting up:', error);
  }

  // Hint: Use `globalThis` to pass variables to global teardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};

// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
