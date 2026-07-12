import type { EloPoint } from "@/types/history";

const MAX_STORED_POINTS_PER_PLAYER = 180;

export function downsampleEloPoints(
  points: EloPoint[],
  maximumPoints = MAX_STORED_POINTS_PER_PLAYER,
): EloPoint[] {
  if (maximumPoints < 2 || points.length <= maximumPoints) {
    return points;
  }

  const lastIndex = points.length - 1;

  const selected = new Map<number, EloPoint>();

  selected.set(0, points[0]);
  selected.set(lastIndex, points[lastIndex]);

  const interiorCount = maximumPoints - 2;

  for (let index = 1; index <= interiorCount; index += 1) {
    const sourceIndex = Math.round((index * lastIndex) / (interiorCount + 1));

    const point = points[sourceIndex];

    if (point) {
      selected.set(sourceIndex, point);
    }
  }

  return [...selected.entries()]
    .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
    .map(([, point]) => point);
}
