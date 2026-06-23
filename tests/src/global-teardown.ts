import { deleteAllFiles } from './fixtures';

export default async function globalTeardown() {
  await deleteAllFiles();
}
