const { existsSync, readFileSync, writeFileSync } = require('fs');
const crypto = require('crypto');
const path = require('path');
const { execSync } = require('child_process');

const IMAGE_NAME = 'donalffons/opencascade.js:2.0.0-beta.371bbb0';

const OPEN_CASCADE_DIR = path.join('src', 'worker', 'opencascade');

const VERSION_FILE_NAME = 'jupytercad.opencascade.version';
const VERSION_FILE_PATH = path.join(OPEN_CASCADE_DIR, VERSION_FILE_NAME);

const hashSum = crypto.createHash('sha256');

hashSum.update(readFileSync(path.join(OPEN_CASCADE_DIR, 'build.yml')));
const buildHash = hashSum.digest('hex');

let needsRebuild = true;

if (existsSync(VERSION_FILE_PATH)) {
  const currentHash = readFileSync(VERSION_FILE_PATH, {
    encoding: 'utf8',
    flag: 'r'
  });

  if (currentHash === buildHash) {
    needsRebuild = false;
  }
}

if (needsRebuild) {
  execSync(`docker pull ${IMAGE_NAME}`);

  execSync(
    `docker run --rm -v "$(pwd):/src" -u "$(id -u):$(id -g)" ${IMAGE_NAME} build.yml`,
    { cwd: OPEN_CASCADE_DIR }
  );

  writeFileSync(VERSION_FILE_PATH, buildHash);
}
