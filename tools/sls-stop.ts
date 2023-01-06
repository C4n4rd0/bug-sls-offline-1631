/* tslint:disable:no-console */
import find from 'find-process';

(async function execute() {
  try {
    const list = await find('name', 'node');
    const pid = list.find((process) => process.cmd.includes('SLS_BUG_SLS_OFFLINE_APP'))?.pid;
    pid && process.kill(pid, 'SIGINT');
  } catch (e: any) {
    console.log(e.stack || e);
  }
})();
