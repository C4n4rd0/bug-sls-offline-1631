/* eslint-disable @typescript-eslint/no-var-requires */
const accountId = '101010101010';
const region = 'eu-central-1';
const stage = 'unit';

process.env.SERVICE = 'bug-sls-offline';
process.env.STAGE = stage;
process.env.REGION = region;
process.env.ACCOUNT_ID = accountId;

module.exports = async () => Promise.all([]);
