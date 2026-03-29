// tests/setup.js
// Set test environment variables before any modules load
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/hydralert_test';
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.ML_SERVICE_URL = 'http://localhost:5001';
