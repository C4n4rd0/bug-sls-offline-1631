import { Handler } from 'aws-lambda/handler';
import { CodeArtifactUserPendingException } from '../domain/errors';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

export const handler: Handler<any> = async () => {
  const logger = new Logger('Task1');
  logger.log('Inside Task1');
  const counterFilePath = process.env.COUNTER_FILE_PATH;
  let count = 0;

  if(fs.existsSync(counterFilePath!)) {
    const countFromFile = await fs.promises.readFile(counterFilePath!);
    count = Number(countFromFile);
  }

  logger.log(`count: ${count++}`);
  await fs.promises.writeFile(counterFilePath!,`${count}`);

  if(count < 3) {
    throw new CodeArtifactUserPendingException('INFO: Lambda is initializing your function. It will be ready to invoke shortly.');
  }
};
