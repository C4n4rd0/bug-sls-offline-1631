export function isLocal() {
  return ['offline'].includes(process.env.STAGE!);
}
