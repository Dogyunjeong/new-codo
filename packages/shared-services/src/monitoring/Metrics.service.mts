interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface CounterMetric {
  count: number;
  lastIncrement: number;
}

interface GaugeMetric {
  value: number;
  lastUpdate: number;
}

interface HistogramMetric {
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
}

export class MetricsService {
  private counters: Map<string, CounterMetric> = new Map();
  private gauges: Map<string, GaugeMetric> = new Map();
  private histograms: Map<string, HistogramMetric> = new Map();
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // Counter metrics - values that only increase
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    const existing = this.counters.get(key) || { count: 0, lastIncrement: 0 };
    
    this.counters.set(key, {
      count: existing.count + value,
      lastIncrement: Date.now()
    });
  }

  getCounter(name: string, tags?: Record<string, string>): number {
    const key = this.getMetricKey(name, tags);
    return this.counters.get(key)?.count || 0;
  }

  // Gauge metrics - values that can go up and down
  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    this.gauges.set(key, {
      value,
      lastUpdate: Date.now()
    });
  }

  getGauge(name: string, tags?: Record<string, string>): number | undefined {
    const key = this.getMetricKey(name, tags);
    return this.gauges.get(key)?.value;
  }

  // Histogram metrics - for measuring distributions of values
  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    const existing = this.histograms.get(key) || {
      values: [],
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity
    };

    existing.values.push(value);
    existing.count += 1;
    existing.sum += value;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);

    // Keep only last 1000 values to prevent memory issues
    if (existing.values.length > 1000) {
      existing.values = existing.values.slice(-1000);
    }

    this.histograms.set(key, existing);
  }

  getHistogramStats(name: string, tags?: Record<string, string>): {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | undefined {
    const key = this.getMetricKey(name, tags);
    const histogram = this.histograms.get(key);
    
    if (!histogram || histogram.count === 0) {
      return undefined;
    }

    const sortedValues = [...histogram.values].sort((a, b) => a - b);
    const avg = histogram.sum / histogram.count;

    return {
      count: histogram.count,
      sum: histogram.sum,
      min: histogram.min,
      max: histogram.max,
      avg,
      p50: this.getPercentile(sortedValues, 0.5),
      p95: this.getPercentile(sortedValues, 0.95),
      p99: this.getPercentile(sortedValues, 0.99)
    };
  }

  // Application-specific metrics
  recordRequestDuration(path: string, method: string, statusCode: number, duration: number): void {
    this.recordHistogram('request_duration_ms', duration, {
      path,
      method,
      status_code: statusCode.toString()
    });

    this.incrementCounter('requests_total', 1, {
      path,
      method,
      status_code: statusCode.toString()
    });
  }

  recordDatabaseOperation(operation: string, table: string, duration: number): void {
    this.recordHistogram('database_operation_duration_ms', duration, {
      operation,
      table
    });

    this.incrementCounter('database_operations_total', 1, {
      operation,
      table
    });
  }

  recordServiceCall(targetService: string, endpoint: string, duration: number, statusCode?: number): void {
    this.recordHistogram('service_call_duration_ms', duration, {
      target_service: targetService,
      endpoint,
      status_code: statusCode?.toString() || 'unknown'
    });

    this.incrementCounter('service_calls_total', 1, {
      target_service: targetService,
      endpoint,
      status_code: statusCode?.toString() || 'unknown'
    });
  }

  recordBusinessEvent(eventType: string, entityType?: string): void {
    this.incrementCounter('business_events_total', 1, {
      event_type: eventType,
      entity_type: entityType || 'unknown'
    });
  }

  // System metrics
  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    this.setGauge('memory_heap_used_bytes', usage.heapUsed);
    this.setGauge('memory_heap_total_bytes', usage.heapTotal);
    this.setGauge('memory_external_bytes', usage.external);
    this.setGauge('memory_rss_bytes', usage.rss);
  }

  recordCpuUsage(cpuPercent: number): void {
    this.setGauge('cpu_usage_percent', cpuPercent);
  }

  // Export all metrics for monitoring systems
  exportMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    histograms: Record<string, any>;
    service: string;
    timestamp: number;
  } {
    const counters: Record<string, number> = {};
    const gauges: Record<string, number> = {};
    const histograms: Record<string, any> = {};

    this.counters.forEach((metric, key) => {
      counters[key] = metric.count;
    });

    this.gauges.forEach((metric, key) => {
      gauges[key] = metric.value;
    });

    this.histograms.forEach((metric, key) => {
      histograms[key] = this.getHistogramStats(key.split('|')[0], this.parseTags(key));
    });

    return {
      counters,
      gauges,
      histograms,
      service: this.serviceName,
      timestamp: Date.now()
    };
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }

    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    return `${name}|${tagString}`;
  }

  private parseTags(key: string): Record<string, string> | undefined {
    const parts = key.split('|');
    if (parts.length < 2) {
      return undefined;
    }

    const tags: Record<string, string> = {};
    const tagPairs = parts[1].split(',');
    
    for (const pair of tagPairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        tags[key] = value;
      }
    }

    return tags;
  }

  private getPercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil(sortedValues.length * percentile) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
  }
}