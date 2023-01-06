import { Handler } from 'aws-lambda/handler';
import { Logger } from '@nestjs/common';

export const handler: Handler<any> = async () => {
  const logger = new Logger('Task2');
  logger.log('Inside Task2');
  return {
    status_code: 'OK',
  };
};
