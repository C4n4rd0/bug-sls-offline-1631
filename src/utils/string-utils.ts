import { isAWSError } from './aws-utils';
import { isAxiosResponse } from './http-utils';

export function isBlank(str: string | undefined): str is undefined {
  return !str || str.trim() === '';
}

export function obfuscateString(data: string | undefined) {
  return `${(data || '').trim().substring(0, 5)}*****`;
}

const unknownMessage = 'Unknown';
export function errorMessage(error: any): string {
  if (!error) {
    return unknownMessage;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (isAWSError(error)) {
    return `${error.code}/${error.message}`;
  }
  if (isAxiosResponse(error)) {
    const result = error.response.data?.message || error.response.statusText;
    if (result) {
      return result;
    }
  }
  return error.message || unknownMessage;
}
