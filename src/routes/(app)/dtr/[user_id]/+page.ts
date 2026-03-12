import { isUserIsExistInDatabase, getUser } from '$lib/helper/db-helper';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const userId = Number(params.user_id);
  return { user: userId ? await getUser(userId) : undefined };
};
