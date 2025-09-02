import express from 'express';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import sendMail from './sendMail.js';
// Load environment variables from .env file
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
// Middleware to parse JSON bodies
app.use(express.json());
// Set up Redis connection
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.error("REDIS_URL environment variable is not set.");
    process.exit(1);
}
const redis = new Redis(redisUrl);
const queueName = 'email_queue';
console.log('Worker server started. Waiting for emails in the queue...');
// Worker function to process the queue
async function processQueue() {
    try {
        // Use blocking list pop (BRPOP) to wait for an item in the queue
        // '0' means it will wait indefinitely
        const result = await redis.brpop(queueName, 0);
        if (result) {
            const [key, rawMessage] = result;
            console.log("Processing message from queue:", rawMessage);
            const mailOptions = JSON.parse(rawMessage);
            // Send the email using the local sendMail function
            await sendMail(mailOptions);
        }
    }
    catch (error) {
        console.error('Error processing queue:', error);
    }
    finally {
        // Recursively call the function to keep processing the queue
        processQueue();
    }
}
// Start the queue worker
processQueue();
// API endpoint to add data to the Redis cache
app.post('/compound', async (req, res) => {
    const compoundData = req.body;
    // Check if the required properties exist in the payload
    const requiredKeys = [
        'iupacName',
        'link1',
        'link2',
        'molecularFormula',
        'molecularWeight',
        'name',
        'smiles'
    ];
    const missingKeys = requiredKeys.filter(key => !(key in compoundData));
    if (missingKeys.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingKeys.join(', ')}` });
    }
    const cacheKey = `compound:${compoundData.name}`;
    try {
        // Store the compound data in Redis, stringifying it first
        await redis.set(cacheKey, JSON.stringify(compoundData));
        // Set an expiration time for the key (e.g., 1 hour)
        await redis.expire(cacheKey, 3600);
        console.log(`Successfully added ${compoundData.name} to cache with key: ${cacheKey}`);
        return res.status(201).json({ message: 'Compound data added to cache.' });
    }
    catch (error) {
        console.error("Error setting data in cache:", error);
        return res.status(500).json({ error: 'Failed to set compound in cache.' });
    }
});
// Caching API endpoint to get data from Redis
app.get('/compound/:compoundName', async (req, res) => {
    const { compoundName } = req.params;
    const cacheKey = `compound:${compoundName}`;
    try {
        // Check Redis cache for the compound data
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for ${compoundName}`);
            const data = JSON.parse(cachedData);
            return res.status(200).json(data);
        }
        else {
            // Data not in cache, respond with 404 as the client will handle the database lookup
            console.log(`Cache miss for ${compoundName}. Responding with 404.`);
            return res.status(404).json({ error: 'Compound not found in cache.' });
        }
    }
    catch (error) {
        console.error("Error retrieving from cache:", error);
        return res.status(500).json({ error: 'Failed to retrieve compound from cache.' });
    }
});
// Optional: Start a simple Express server to show that the worker is running
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
app.get('/', (req, res) => {
    res.status(200).send('Email worker and caching server are running.');
});
// Graceful shutdown function
function shutdown() {
    console.log('\nShutting down gracefully...');
    // Close Express server
    server.close(() => {
        console.log('Express server closed.');
    });
    // Close Redis connection
    redis.quit(() => {
        console.log('Redis connection closed.');
        process.exit(0);
    });
}
// Listen for shutdown signals
process.on('SIGTERM', shutdown); // For process managers
process.on('SIGINT', shutdown); // For Ctrl+C
//# sourceMappingURL=server.js.map