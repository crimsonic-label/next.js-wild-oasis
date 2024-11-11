import { getCabins } from "@/app/_lib/data-service";

export const revalidate = 86400;

export default async function CabinCount() {
  const cabins = await getCabins();

  if (!cabins.length) return 0;
  return cabins.length;
}
