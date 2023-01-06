import { isLocal } from "./env-utils";

export const getLocalConfigurationIfNecessary = () => {
  const stage = process.env.STAGE;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  return { isLocalStage: isLocal(), stage, accessKeyId, secretAccessKey };
};
