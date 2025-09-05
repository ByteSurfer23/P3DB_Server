import express, { type Request, type Response } from 'express';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import sendMail from './sendMail.js';
import client, { Counter, MetricType } from 'prom-client';

// Node 20+ fetch is global
dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(express.json());

// Prometheus: collect default metrics
client.collectDefaultMetrics();

// Custom HTTP request counter
const httpRequestCounter: Counter<string> = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP Requests'
});

// Redis setup
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("REDIS_URL environment variable is not set.");
  process.exit(1);
}
const redis = new Redis(redisUrl);
const queueName = 'email_queue';

console.log('Worker server started. Waiting for emails in the queue...');

// Worker function
async function processQueue(): Promise<void> {
  try {
    const result = await redis.brpop(queueName, 0);
    if (result) {
      const [key, rawMessage] = result;
      console.log("Processing message from queue:", rawMessage);
      const mailOptions = JSON.parse(rawMessage);
      await sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error processing queue:', error);
  } finally {
    processQueue();
  }
}
processQueue();

// POST /compound
app.post('/compound', async (req: Request, res: Response) => {
  const compoundData = req.body;

  const requiredKeys = [
    'iupacName', 'link1', 'link2', 'molecularFormula',
    'molecularWeight', 'name', 'smiles'
  ];
  const missingKeys = requiredKeys.filter(key => !(key in compoundData));

  if (missingKeys.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missingKeys.join(', ')}` });
  }

  const cacheKey = `compound:${compoundData.name}`;

  try {
    await redis.set(cacheKey, JSON.stringify(compoundData));
    await redis.expire(cacheKey, 3600);
    console.log(`Successfully added ${compoundData.name} to cache with key: ${cacheKey}`);
    return res.status(201).json({ message: 'Compound data added to cache.' });
  } catch (error) {
    console.error("Error setting data in cache:", error);
    return res.status(500).json({ error: 'Failed to set compound in cache.' });
  }
});

// GET /compound/:compoundName
app.get('/compound/:compoundName', async (req: Request, res: Response) => {
  const { compoundName } = req.params;
  const cacheKey = `compound:${compoundName}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${compoundName}`);
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      console.log(`Cache miss for ${compoundName}. Responding with 404.`);
      return res.status(404).json({ error: 'Compound not found in cache.' });
    }
  } catch (error) {
    console.error("Error retrieving from cache:", error);
    return res.status(500).json({ error: 'Failed to retrieve compound from cache.' });
  }
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => res.send('Email worker and caching server are running.'));

// Prometheus metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// ---------------------
// Grafana Cloud OTLP push
// ---------------------
const GRAFANA_OTLP_URL = process.env.GRAFANA_OTLP_URL;
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;

async function pushMetricsToGrafana(): Promise<void> {
  if (!GRAFANA_OTLP_URL || !GRAFANA_API_KEY) return;

  try {
    const metrics = await client.register.getMetricsAsJSON();

    const otlpBody = {
      resourceMetrics: [
        {
          scopeMetrics: [
            {
              metrics: metrics.map(m => ({
                name: m.name,
                description: m.help,
                unit: "1",
                gauge: {
                  dataPoints: m.type === MetricType.Counter
                    ? m.values.map(v => ({
                        value: v.value,
                        timeUnixNano: Date.now() * 1e6,
                        attributes: Object.entries(v.labels || {}).map(([k, val]) => ({
                          key: k,
                          value: { stringValue: val }
                        }))
                      }))
                    : []
                }
              }))
            }
          ]
        }
      ]
    };

    const response = await fetch(GRAFANA_OTLP_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GRAFANA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(otlpBody)
    });

    console.log(`Pushed metrics to Grafana Cloud. Status: ${response.status}`);
  } catch (err) {
    console.error('Error pushing metrics to Grafana Cloud:', err);
  }
}

// Push metrics every 15 seconds
setInterval(pushMetricsToGrafana, 15000);

// ---------------------
// Start server
// ---------------------
const server = app.listen(port, () => console.log(`Server listening on port ${port}`));

// Graceful shutdown
function shutdown(): void {
  console.log('\nShutting down gracefully...');
  server.close(() => console.log('Express server closed.'));
  redis.quit(() => {
    console.log('Redis connection closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
