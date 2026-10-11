
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'ChargeDB';

const client = new MongoClient(MONGO_URL);

let db;
let users;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// --------------------------------------------------
// HOME AND CONNECTION TESTS
// --------------------------------------------------

app.get('/', (req, res) => {
  res.send('Charge backend is running!');
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Charge backend connected!',
    app: 'Charge'
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    await db.command({ ping: 1 });

    res.json({
      message: 'Charge connected to MongoDB successfully!',
      database: db.databaseName
    });
  } catch (error) {
    console.error('Database test error:', error.message);

    res.status(500).json({
      message: 'Database connection failed.'
    });
  }
});

// --------------------------------------------------
// SHARED REGISTRATION FOR CUSTOMERS, SHOP OWNERS,
// AND RIDERS
// --------------------------------------------------

async function registerAccount(req, res, role) {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check common required fields
    if (
      typeof fullName !== 'string' ||
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      typeof password !== 'string' ||
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Please fill in all required fields.'
      });
    }

    // Validate password length
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: 'Password must be between 8 and 72 characters.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    // Extra details for shop owners and riders
    let shopName;
    let shopAddress;
    let bikeRegistration;
    let serviceArea;

    // Shop-owner validation
    if (role === 'shop_owner') {
      if (
        typeof req.body.shopName !== 'string' ||
        !req.body.shopName.trim() ||
        typeof req.body.shopAddress !== 'string' ||
        !req.body.shopAddress.trim()
      ) {
        return res.status(400).json({
          message: 'Please enter your shop name and address.'
        });
      }

      shopName = req.body.shopName.trim();
      shopAddress = req.body.shopAddress.trim();
    }

    // Rider validation
    if (role === 'rider') {
      if (
        typeof req.body.bikeRegistration !== 'string' ||
        !req.body.bikeRegistration.trim() ||
        typeof req.body.serviceArea !== 'string' ||
        !req.body.serviceArea.trim()
      ) {
        return res.status(400).json({
          message: 'Please enter your bike registration and service area.'
        });
      }

      bikeRegistration = req.body.bikeRegistration.trim();
      serviceArea = req.body.serviceArea.trim();
    }

    // Check whether this email already exists
    const existingUser = await users.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    // Store a password hash, never the original password
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = {
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash,
      role,
      createdAt: new Date()
    };

    // Save shop-owner details
    if (role === 'shop_owner') {
      newUser.shopName = shopName;
      newUser.shopAddress = shopAddress;
      newUser.shopStatus = 'pending_review';
    }

    // Save rider details
    if (role === 'rider') {
      newUser.bikeRegistration = bikeRegistration;
      newUser.serviceArea = serviceArea;
    }

    const result = await users.insertOne(newUser);

    const accountType =
      role === 'customer'
        ? 'Customer'
        : role === 'shop_owner'
          ? 'Shop owner'
          : 'Rider';

    return res.status(201).json({
      message:
        role === 'shop_owner'
          ? 'Shop owner registered successfully. Your shop is pending review.'
          : `${accountType} registered successfully!`,

      user: {
        id: result.insertedId,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,

        ...(newUser.shopName
          ? {
              shopName: newUser.shopName,
              shopAddress: newUser.shopAddress,
              shopStatus: newUser.shopStatus
            }
          : {}),

        ...(newUser.bikeRegistration
          ? {
              bikeRegistration: newUser.bikeRegistration,
              serviceArea: newUser.serviceArea
            }
          : {})
      }
    });
  } catch (error) {
    console.error(`${role} registration error:`, error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    return res.status(500).json({
      message: 'Registration failed. Please try again.'
    });
  }
}

// Customer registration
app.post('/api/customers/register', (req, res) => {
  return registerAccount(req, res, 'customer');
});

// Shop-owner registration
app.post('/api/shop-owners/register', (req, res) => {
  return registerAccount(req, res, 'shop_owner');
});

// Rider registration
app.post('/api/riders/register', (req, res) => {
  return registerAccount(req, res, 'rider');
});
// --------------------------------------------------
// GET REGISTERED SHOPS
// --------------------------------------------------

app.get('/api/shops', async (req, res) => {
  try {
    const shops = await users
      .find(
        {
          role: 'shop_owner',
          shopName: { $exists: true, $ne: '' },
          shopAddress: { $exists: true, $ne: '' }
        },
        {
          projection: {
            passwordHash: 0
          }
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    const shopList = shops.map((shop) => ({
      id: shop._id.toString(),
      shopName: shop.shopName,
      shopAddress: shop.shopAddress,
      shopStatus: shop.shopStatus || 'pending_review',
      location: shop.location || null
    }));

    res.json({ shops: shopList });
  } catch (error) {
    console.error('Fetch shops error:', error.message);

    res.status(500).json({
      message: 'Unable to load registered shops.'
    });
  }
});

// --------------------------------------------------
// SHARED LOGIN FOR ALL ACCOUNT TYPES
// --------------------------------------------------

async function loginAccount(req, res, role) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Please enter your email and password.'
      });
    }

    const account = await users.findOne({
      email: email.trim().toLowerCase(),
      role
    });

    if (!account) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      account.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const accountType =
      role === 'customer'
        ? 'Customer'
        : role === 'shop_owner'
          ? 'Shop owner'
          : 'Rider';

    return res.json({
      message: `${accountType} login successful!`,

      user: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        role: account.role,

        ...(account.shopName
          ? {
              shopName: account.shopName,
              shopAddress: account.shopAddress,
              shopStatus: account.shopStatus
            }
          : {}),

        ...(account.bikeRegistration
          ? {
              bikeRegistration: account.bikeRegistration,
              serviceArea: account.serviceArea
            }
          : {})
      }
    });
  } catch (error) {
    console.error(`${role} login error:`, error.message);

    return res.status(500).json({
      message: 'Login failed. Please try again.'
    });
  }
}

// Customer login
app.post('/api/customers/login', (req, res) => {
  return loginAccount(req, res, 'customer');
});

// Shop-owner login
app.post('/api/shop-owners/login', (req, res) => {
  return loginAccount(req, res, 'shop_owner');
});

// Rider login
app.post('/api/riders/login', (req, res) => {
  return loginAccount(req, res, 'rider');
});

// --------------------------------------------------
// START SERVER AFTER MONGODB CONNECTS
// --------------------------------------------------

async function startServer() {
  try {
    await client.connect();

    db = client.db(DATABASE_NAME);
    users = db.collection('users');

    console.log(`MongoDB connected to ${DATABASE_NAME}`);

    app.listen(PORT, () => {
      console.log(
        `Charge backend running at http://localhost:${PORT}`
      );

      console.log(
        'Customer, shop-owner, and rider routes are ready.'
      );
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
