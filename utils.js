const { exec } = require('child_process');
const net = require('net');

const cloneRepository = (repoUrl) => {
  return new Promise((resolve, reject) => {
    exec(`git ls-remote --heads ${repoUrl}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        const branches = stdout
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .map((line) => line.split('\t')[1].replace('refs/heads/', ''))
          .sort(); // Sort branches in ascending order

        const latestBranch = branches.pop(); // Get the latest branch (last in the sorted list)

        exec(`git clone --branch ${latestBranch} --single-branch ${repoUrl}`, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      }
    });
  });
};


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

// function startService(path, port) {
//   return new Promise((resolve, reject) => {
//     const startScriptExists = require('fs').existsSync(`${path}/package.json`) &&
//       require(`${path}/package.json`).scripts &&
//       require(`${path}/package.json`).scripts.start;

//     if (!startScriptExists) {
//       reject(`Cannot start service at path ${path}: no start script found in package.json`);
//     }

//     const command = `cd ${path} && PORT=${port} npm start`;

//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(stdout.trim());
//       }
//     });
//   });
// }

function isPortInUse(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}


function startService(path, port, debugCommand = '') {
  const command = debugCommand
    ? `PORT=${port} code --folder-uri "${path}" --remote-debugging-port=${port} --inspect-brk=0`
    : `PORT=${port} code --folder-uri "${path}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = { cloneRepository, installDependencies, buildService, startService, isPortInUse };

