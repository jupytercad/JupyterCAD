const { existsSync } = require('fs');
const { execSync } = require('node:child_process');

if (!existsSync('src/worker/opencascade/jupytercad.opencascade.wasm')) {
    const IMAGE_NAME = 'donalffons/opencascade.js:2.0.0-beta.371bbb0';

    execSync(`docker pull ${IMAGE_NAME}`);

    execSync(`docker run --rm -v "$(pwd):/src" -u "$(id -u):$(id -g)" ${IMAGE_NAME} build.yml`, { cwd: 'src/worker/opencascade' });
}
