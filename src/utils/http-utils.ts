import { AxiosResponse } from 'axios';
import { ClientRequest } from 'http';

export type AxiosResponseError = { status: number; data: any };

export function isAxiosResponse(e: any): e is { response: AxiosResponse } {
  return !!e.response;
}

export function isAxiosRequestResponse(e: any): e is { request: ClientRequest } {
  return !!e.request;
}

export function extractAxiosResponse(e: any) {
  return isAxiosResponse(e) ? { status: e.response.status, data: e.response.data } : e;
}
