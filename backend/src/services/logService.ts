import { LogModel, ILog, LogLevel } from "../models/Log";
import { PatternModel } from "../models/Pattern";
import { ParsedLog, normalizePattern } from "../utils/logParser";

export async function ingestLogs(parsedLogs: ParsedLog[]): Promise<ILog[]> {
  if (!parsedLogs.length) return [];

  const created = await LogModel.insertMany(parsedLogs, { ordered: false });

  const patternMap = new Map<
    string,
    { count: number; example: string }
  >();

  for (const pl of parsedLogs) {
    const pattern = normalizePattern(pl.message);
    const existing = patternMap.get(pattern) || { count: 0, example: pl.message };
    existing.count += 1;
    patternMap.set(pattern, existing);
  }

  const bulkOps = Array.from(patternMap.entries()).map(
    ([pattern, { count, example }]) => ({
      updateOne: {
        filter: { pattern },
        update: {
          $inc: { frequency: count },
          $setOnInsert: { example }
        },
        upsert: true
      }
    })
  );

  if (bulkOps.length) {
    await PatternModel.bulkWrite(bulkOps);
  }

  return created;
}

export async function getLogs(
  level?: LogLevel,
  service?: string,
  page = 1,
  pageSize = 50,
  search?: string
): Promise<{ data: ILog[]; total: number }> {
  const query: Record<string, unknown> = {};
  if (level) query.level = level;
  if (service) query.service = service;
  if (search) {
    query.$or = [
      { message: { $regex: search, $options: "i" } },
      { rawLine: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    LogModel.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    LogModel.countDocuments(query)
  ]);

  return { data: data as unknown as ILog[], total };
}

export async function getLogStats(): Promise<{
  total: number;
  byLevel: Record<LogLevel, number>;
  uniquePatterns: number;
}> {
  const [total, agg, uniquePatterns] = await Promise.all([
    LogModel.countDocuments({}),
    LogModel.aggregate<{ _id: LogLevel; count: number }>([
      { $group: { _id: "$level", count: { $sum: 1 } } }
    ]),
    PatternModel.countDocuments({})
  ]);

  const byLevel: Record<LogLevel, number> = {
    CRITICAL: 0,
    ERROR: 0,
    WARN: 0,
    INFO: 0,
    DEBUG: 0
  };

  for (const row of agg) {
    byLevel[row._id] = row.count;
  }

  return { total, byLevel, uniquePatterns };
}

export async function getServiceHealth(): Promise<
  {
    service: string;
    counts: Record<LogLevel, number>;
  }[]
> {
  const agg = await LogModel.aggregate<{
    _id: { service: string; level: LogLevel };
    count: number;
  }>([
    {
      $group: {
        _id: { service: "$service", level: "$level" },
        count: { $sum: 1 }
      }
    }
  ]);

  const map = new Map<
    string,
    { service: string; counts: Record<LogLevel, number> }
  >();

  for (const row of agg) {
    const svc = row._id.service;
    const level = row._id.level;
    if (!map.has(svc)) {
      map.set(svc, {
        service: svc,
        counts: {
          CRITICAL: 0,
          ERROR: 0,
          WARN: 0,
          INFO: 0,
          DEBUG: 0
        }
      });
    }
    const entry = map.get(svc)!;
    entry.counts[level] += row.count;
  }

  return Array.from(map.values());
}

