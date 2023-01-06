/* istanbul ignore file */
import { platform } from 'os';
import { ChildProcessByStdio, spawn, spawnSync } from 'child_process';
import { Readable, Writable } from 'node:stream';

let slsOfflineProcess: ChildProcessByStdio<Writable, Readable, Readable> | null;

export function getSlsOfflineStartTimeout() {
  return process.env.SLS_OFFLINE_START_TIMEOUT !== undefined ? Number(process.env.SLS_OFFLINE_START_TIMEOUT) : 60_000;
}

export function startSlsOffline(...logStartCondition: string[]) {
  const timeout = getSlsOfflineStartTimeout();

  return startSlsOfflineWithTimeout(timeout, logStartCondition);
}

export function startSlsOfflineWithTimeout(timeout: number, logStartCondition: string[]) {
  slsOfflineProcess = spawn(`npm${platform() === 'win32' ? '.cmd' : ''}`, 'run sls:start'.split(' '), {
    shell: false,
    cwd: process.cwd(),
    env: process.env,
  });
  return finishLoading(logStartCondition, timeout);
}

export function stopSlsOffline() {
  spawnSync(`npm${platform() === 'win32' ? '.cmd' : ''}`, 'run sls:stop'.split(' '), {
    shell: false,
    cwd: process.cwd(),
    env: process.env,
  });
  process.stdout.write('Serverless Offline stopped');
}

export function deploySlsOfflineConfiguration(script = 'sls:config:deploy') {
  spawnSync(`npm${platform() === 'win32' ? '.cmd' : ''}`, `run ${script}`.split(' '), {
    shell: false,
    cwd: process.cwd(),
    env: process.env,
  });
  process.stdout.write('Serverless Offline configuration deployed');
}

function finishLoading(logStartCondition: string[], timeout = 60_000) {
  return new Promise<{ message: string; slsProcess: ChildProcessByStdio<Writable, Readable, Readable> }>(
    (resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject({ message: 'timeout waiting for log-start condition', slsProcess: slsOfflineProcess }),
        timeout,
      );

      slsOfflineProcess!.stdout.on('data', checkStarted);
      slsOfflineProcess!.stderr.on('data', checkStarted);

      function checkStarted(data: string) {
        process.stdout.write(data.toString());

        const slsStarted = isSlsStarted(data, logStartCondition);
        const addressAlreadyInUse = data.includes('address already in use');

        if (slsStarted || addressAlreadyInUse) {
          clearTimeout(timeoutId);
          if (slsStarted) {
            displayPID(data);
            resolve({ message: 'ok', slsProcess: slsOfflineProcess! });
          } else {
            reject({ message: data.toString().trim(), slsProcess: slsOfflineProcess! });
          }
        }
      }
    },
  );
}

function isSlsStarted(data: string, logStartCondition: string[]) {
  let nbIncludeOk = 0;
  for (const line of logStartCondition) {
    if (data.includes(line)) {
      nbIncludeOk++;
    }
  }
  return nbIncludeOk === logStartCondition.length;
}

function displayPID(data: string) {
  process.stdout.write(data.toString().trim());
  process.stdout.write(`Serverless: Offline started with PID : ${slsOfflineProcess!.pid}`);
}
