import { getLocalConfigurationIfNecessary } from './client.utils';
import { isValidUrl } from './url-utils';
import { DescribeExecutionInput, StartExecutionInput } from 'aws-sdk/clients/stepfunctions';
import AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

export const getStepFunctionLocalConfigurationIfNecessary = () => {
  const { isLocalStage, accessKeyId, secretAccessKey } = getLocalConfigurationIfNecessary();
  const snfAwsEndpoint = process.env.AWS_SFN_ENDPOINT;
  if (!isLocalStage || !isValidUrl(snfAwsEndpoint)) {
    return undefined;
  }
  return { accessKeyId, secretAccessKey, endpoint: process.env.AWS_SFN_ENDPOINT };
};

export const startExecution = async (sfnClient: AWS.StepFunctions, params: StartExecutionInput): Promise<PromiseResult<AWS.StepFunctions.StartExecutionOutput, AWS.AWSError>> => {
  return await sfnClient.startExecution(params).promise();
};

export const describeExecution = async (sfnClient: AWS.StepFunctions, params: DescribeExecutionInput): Promise<PromiseResult<AWS.StepFunctions.DescribeExecutionOutput, AWS.AWSError>> => {
  return await sfnClient.describeExecution(params).promise();
};
