import { AWSError } from 'aws-sdk';

export function isAWSError(error: any): error is AWSError {
  return 'name' in error && 'code' in error && 'message' in error && 'time' in error;
}
