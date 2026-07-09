import { AOE4WORLD_API } from "@/lib/constants";

export async function aoe4Request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${AOE4WORLD_API}${endpoint}`, {
    headers: {
      Accept: "application/json",
    },

    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`AOE4World API error: ${response.status}`);
  }

  return response.json();
}
