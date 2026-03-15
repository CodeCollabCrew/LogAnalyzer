import { LogModel, LogLevel } from "../models/Log";
import { CorrelationModel, ICorrelation } from "../models/Correlation";

const DEFAULT_WINDOW_MS = 60 * 1000;

export async function recomputeCorrelations(
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<ICorrelation[]> {
  const logs = await LogModel.find({
    level: { $in: ["CRITICAL", "ERROR", "WARN"] as LogLevel[] }
  })
    .sort({ timestamp: 1 })
    .lean();

  const pairsCount = new Map<string, number>();

  let windowStartIdx = 0;
  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    const currentTime = current.timestamp.getTime();

    while (
      logs[windowStartIdx] &&
      currentTime - logs[windowStartIdx].timestamp.getTime() > windowMs
    ) {
      windowStartIdx++;
    }

    const servicesInWindow = new Set<string>();
    for (let j = windowStartIdx; j <= i; j++) {
      servicesInWindow.add(logs[j].service);
    }
    const arr = Array.from(servicesInWindow).sort();
    for (let a = 0; a < arr.length; a++) {
      for (let b = a + 1; b < arr.length; b++) {
        const key = `${arr[a]}||${arr[b]}`;
        pairsCount.set(key, (pairsCount.get(key) || 0) + 1);
      }
    }
  }

  const bulkOps: {
    updateOne: {
      filter: { serviceA: string; serviceB: string };
      update: { $set: { count: number } };
      upsert: boolean;
    };
  }[] = [];

  for (const [key, count] of pairsCount.entries()) {
    const [serviceA, serviceB] = key.split("||");
    bulkOps.push({
      updateOne: {
        filter: { serviceA, serviceB },
        update: { $set: { count } },
        upsert: true
      }
    });
  }

  if (bulkOps.length) {
    await CorrelationModel.bulkWrite(bulkOps);
  }

  return CorrelationModel.find({})
    .sort({ count: -1 })
    .limit(100)
    .lean() as unknown as ICorrelation[];
}

export async function getCorrelations(): Promise<ICorrelation[]> {
  return CorrelationModel.find({})
    .sort({ count: -1 })
    .limit(100)
    .lean() as unknown as ICorrelation[];
}

