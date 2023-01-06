# Serverless Offline Retry not working issue

---

- [Setup](#setup)
    - [Install](#install)
- [Testing](#testing)
    - [Integration](#integration)

---

## Setup

### Install
Tested on Node 14.18.1
```bash
npm install
npm run sf:install
```

## Testing

### Integration

```bash
# run integration tests
$ npm test

# The step function execute 2 lambdas (Task1 and Task2) sequentially
# The Task1 lambda is configured to retry 3 times if the exception CodeArtifactUserPendingException is thrown
# To reproduce this behaviour, the line 40 in serverless.yml should be commented, the line 41 should not be commented and npm run test should be run with this configuration
# The expected result of this scenario is that the Task1 lambda should be executed 3 times and the step function should succeed, according to the expectations of the integration test
# The found result is that the Task1 lambda is executed only once and the step function fails.
# To bypass this issue, the workaround is to configure the retry behaviour of the Task1 lambda to retry if an Error is thrown on offline stage
# To reproduce this behaviour, the line 40 in serverless.yml should be uncommented, the line 41 should be commented and npm run test should be run with this configuration
# The expected result of this scenario is that the Task1 lambda should be executed only once and the step function should fail because Error is not part of the retry policy
# The found result is that the Task1 lambda is executed 3 times and the step function succeed, according to the expectations of the integration test

# From my understanding, the retry policy is based on the name of exceptions defined in the array Retry.ErrorEquals to check if a retry should occur.
# Cf. https://docs.aws.amazon.com/step-functions/latest/dg/concepts-error-handling.html


```