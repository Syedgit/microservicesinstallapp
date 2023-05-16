const { spawn } = require('child_process');
const express = require('express');

const app = express();

async function installMicroservice(service) {
  try {
    // Clone the microservice repository from GitHub
    const gitProcess = spawn('git', ['clone', service.repo]);

    await new Promise((resolve, reject) => {
      gitProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${service.name} cloning failed.`));
        }
      });
    });

    // Build the microservice with npm
    const buildProcess = spawn('npm', ['run', 'build'], { cwd: service.name });

    await new Promise((resolve, reject) => {
      buildProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${service.name} build failed.`));
        }
      });
    });

    // Install the microservice dependencies with npm
    const npmProcess = spawn('npm', ['i'], { cwd: service.name });

    await new Promise((resolve, reject) => {
      npmProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${service.name} installation failed.`));
        }
      });
    });

    console.log(`${service.name} installation successful!`);
  } catch (err) {
    console.error(err.message);
  }
}

async function installMicroservices(microservices) {
  const installPromises = microservices.map((service) => installMicro
