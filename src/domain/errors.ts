import { AWSError } from 'aws-sdk';
import { randomUUID as uuid } from 'crypto';

abstract class MockAWSException extends Error implements AWSError {
  readonly code: string;
  readonly retryable?: boolean;
  readonly statusCode?: number;
  readonly time: Date;
  readonly requestId?: string;
  protected constructor(
    readonly message: string,
    {
      retryable,
      statusCode,
    }: {
      retryable?: boolean;
      statusCode?: number;
    },
  ) {
    super(message);
    this.code = this.constructor.name;
    this.name = this.constructor.name;
    this.time = new Date();
    this.requestId = uuid();
    this.statusCode = statusCode;
    this.retryable = retryable;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CodeArtifactUserPendingException extends MockAWSException {
  constructor(readonly message: string) {
    super(message, {
      statusCode: 500,
      retryable: true,
    });
  }
}
