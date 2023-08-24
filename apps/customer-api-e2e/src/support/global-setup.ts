import { execSync, exec } from 'child_process';
import {
  execAndWait,
  waitForHealthyDBService,
  waitForAPIReady,
  clearDebugsFolder,
} from './test-utils';
import axios from 'axios';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');
  try {
    // Clear debugs folder
    await clearDebugsFolder();

    // Start the test database using Docker Compose.
    await execAndWait('npm run e2e:db:up');

    // Wait for the database service to be healthy. test_db is the name of the service name in docker-compose.e2e.yml
    await waitForHealthyDBService('test_db');

    // Deploy the schema using Prisma migrations.
    execSync('npm run e2e:db:deploy');

    // Start the application
    await execAndWait('npm run e2e:start', { stdio: 'inherit' });

    try {
      // Start ngrok tunnel
      console.log('Starting ngrok...');
      execSync('npm run e2e:ngrok:start');

      // Poll the ngrok API until it's ready
      let retries = 10;
      let delay = 500; // Start with a half second delay
      while (retries--) {
        try {
          const response = await axios.get('http://localhost:4040/api/tunnels');
          const localhostToPublicURL = response.data.tunnels[0].public_url;
          console.log('ngrok public URL:', localhostToPublicURL);

          // Set the publicUrl as a global variable
          global.localhostToPublicURL = localhostToPublicURL;

          break;
        } catch (error) {
          if (!retries) {
            console.error('Error getting ngrok public URL:', error);
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Double the delay for the next iteration, exponential back-off
        }
      }
    } catch (error) {
      console.error('Error starting ngrok:', error);
    }

    // Start ngrok tunnel
    // exec('npm run e2e:ngrok:start', async (error) => {
    //   if (error) {
    //     console.error('Error starting ngrok:', error);
    //     return;
    //   }

    //   // Poll the ngrok API until it's ready
    //   let retries = 10;
    //   let delay = 500; // Start with a half second delay
    //   while (retries--) {
    //     try {
    //       const response = await axios.get('http://localhost:4040/api/tunnels');
    //       const localhostToPublicURL = response.data.tunnels[0].public_url;
    //       console.log('ngrok public URL:', localhostToPublicURL);

    //       // Set the publicUrl as a global variable
    //       global.localhostToPublicURL = localhostToPublicURL;

    //       break;
    //     } catch (error) {
    //       if (!retries) {
    //         console.error('Error getting ngrok public URL:', error);
    //         break;
    //       }
    //       await new Promise((resolve) => setTimeout(resolve, delay));
    //       delay *= 2; // Double the delay for the next iteration, exponential back-off
    //     }
    //   }
    // });

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
