import { getUserPref } from '$lib/helper';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
  const tab = url.searchParams.get('tab');
  
  if (tab) return { tab: tab as "users" | "logs" };

  const savedTab = await getUserPref('dtr_open_tab');
  if (savedTab) return { tab: savedTab as "users" | "logs" }

  return { tab: "users" };
};