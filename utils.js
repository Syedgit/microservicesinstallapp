const { exec } = require('child_process');

function cloneRepository(url) {
  return new Promise((resolve, reject) => {
    exec(`git clone ${url}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function installDependencies(path) {
  return new Promise((resolve, reject) => {
    exec(`cd ${path} && npm install`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function buildService(path) {
  return new Promise((resolve, reject) => {
    const buildScriptExists = require('fs').existsSync(`${path}/package.json`) &&
      require(`${path}/package.json`).scripts &&
      require(`${path}/package.json`).scripts.build;

    if (!buildScriptExists) {
      resolve();
    }

    exec(`cd ${path} && npm run build`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function startService(path, port) {
  return new Promise((resolve, reject) => {
    const startScriptExists = require('fs').existsSync(`${path}/package.json`) &&
      require(`${path}/package.json`).scripts &&
      require(`${path}/package.json`).scripts.start;

    if (!startScriptExists) {
      reject(`Cannot start service at path ${path}: no start script found in package.json`);
    }

    const command = `cd ${path} && PORT=${port} npm start`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

module.exports = { cloneRepository, installDependencies, buildService, startService };
