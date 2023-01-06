import { randomUUID as uuid } from 'crypto';
import AWS, { AWSError } from 'aws-sdk';
import {DescribeExecutionOutput, StartExecutionInput} from 'aws-sdk/clients/stepfunctions';
import { PromiseResult } from 'aws-sdk/lib/request';
import { getSlsOfflineStartTimeout, startSlsOffline, stopSlsOffline } from '../../src/utils/serverless-utils';
import {
  describeExecution,
  getStepFunctionLocalConfigurationIfNecessary,
  startExecution
} from '../../src/utils/step-functions.utils';
import * as fs from 'fs';

describe('Test step function retry policy', () => {
  const minimumExpectedDefaultSlsOfflineStartTimeout = 240_000;
  let slsTimeout = getSlsOfflineStartTimeout();

  if (slsTimeout < minimumExpectedDefaultSlsOfflineStartTimeout) {
    slsTimeout = minimumExpectedDefaultSlsOfflineStartTimeout;
    process.env.SLS_OFFLINE_START_TIMEOUT = slsTimeout.toString();
  }

  const jestTimeout = slsTimeout + 60_000;
  jest.setTimeout(jestTimeout);

  let stepFunctionClient: AWS.StepFunctions;

  const counterFilePath = './counter.txt';

  beforeAll(async () => {
    const accessKeyId = 'S3RVER';
    const secretAccessKeyId = 'S3RVER';
    const region = 'eu-central-1';

    process.env.SLS_DEBUG = '*';
    process.env.LOG_LEVEL = 'verbose';
    process.env.SLS_OFFLINE_START_TIMEOUT = `${slsTimeout}`;

    // Set AWS related env variables
    process.env.AWS_PROFILE = 'local';
    process.env.AWS_REGION = region;
    process.env.AWS_ACCESS_KEY_ID = accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = secretAccessKeyId;

    // Set app related env variables
    process.env.NODE_ENV = 'integration-test';
    process.env.STAGE = 'offline';

    process.env.ACCOUNT_ID = '101010101010';
    process.env.AWS_LAMBDA_PORT ||= '3101';
    process.env.AWS_LAMBDA_ENDPOINT ||= `http://localhost:${process.env.AWS_LAMBDA_PORT}`;
    process.env.AWS_SFN_ENDPOINT ||= 'http://localhost:8083';
    process.env.WORKFLOW_SFN_ARN = `arn:aws:states:${process.env.REGION}:${process.env.ACCOUNT_ID}:stateMachine:${process.env.SERVICE}-${process.env.STAGE}-step-function`;
    process.env.TASK1_LAMBDA_ARN = `arn:aws:states:${process.env.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.SERVICE}-${process.env.STAGE}-task1`;
    process.env.TASK2_LAMBDA_ARN = `arn:aws:states:${process.env.REGION}:${process.env.ACCOUNT_ID}:function:${process.env.SERVICE}-${process.env.STAGE}-task2`;

    stepFunctionClient = new AWS.StepFunctions({
      region: process.env.REGION,
      ...getStepFunctionLocalConfigurationIfNecessary(),
    });

    process.env.COUNTER_FILE_PATH = counterFilePath;
    if(fs.existsSync(counterFilePath!)) {
      await fs.promises.unlink(counterFilePath);
    }

    try {
      await startSlsOffline('CreateStateMachine', '[200]');
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    } catch (e) {
      const reason = e instanceof Error ? `because "${e.message}":${e.stack}` : `because: ${JSON.stringify(e)}`;
      throw new Error(`Cannot start sls ${reason}`);
    }
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    try {
      stopSlsOffline();
    } catch (e) {
      // Prevent jest pending state in case of a sls stop error
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe('trigger step function', () => {
    it('should apply retry policy due to CodeArtifactUserPendingException on Task1', async () => {
      // Given
      const task1Arn = process.env.TASK1_LAMBDA_ARN;
      const task2Arn = process.env.TASK2_LAMBDA_ARN;
      const executionName = uuid();
      const stepFunctionsArn = process.env.WORKFLOW_SFN_ARN;
      const input = {
        task1Arn,
        task2Arn,
      };
      const params: StartExecutionInput = {
        name: executionName,
        input: JSON.stringify(input),
        stateMachineArn: stepFunctionsArn!,
      };

      // When
      const startExecutionResult = await startExecution(stepFunctionClient, params);

      // Then
      let stepFunctionResult: PromiseResult<DescribeExecutionOutput, AWSError>;
      do {
        await new Promise((resolve) => setTimeout(resolve, 100));
        stepFunctionResult = await describeExecution(stepFunctionClient, { executionArn: startExecutionResult.executionArn });
      } while (stepFunctionResult.status === 'RUNNING');

      // Global assertions
      expect(stepFunctionResult.status).toEqual('SUCCEEDED');

      const countFromFile = await fs.promises.readFile(counterFilePath);
      expect(Number(countFromFile)).toEqual(3);
    });
  });
});
