const express = require('express');
const app = express();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());

// Encryption and Decryption settings
const algorithm = 'aes-256-cbc';
const JWT_SECRET = 'one_piece_secret';
const key = crypto.randomBytes(32); // Use a secure key
const iv = crypto.randomBytes(16); // Initialization vector

// Function to encrypt code
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// Function to decrypt code
function decrypt(encryptedData, iv) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const verifyToken = (res, req, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.id; // Attach user ID to request
        next();
    });
};

// Defined an array of users (not necessary but for practice reasons)
let users = [
    { 
        id: 1, 
        email: "user1@example.com", 
        password: "password1" 
    },
    { 
        id: 2, 
        email: "user2@example.com", 
        password: "password2" 
    },
    {
        id: 3, 
        email: "user3@example.com", 
        password: "password3"
    }
];

// Define an array of snippets through seed data
let snippets = [
    {
      "id": 1,
      "language": "Python",
      "code": "print('Hello, World!')"
    },
    {
      "id": 2,
      "language": "Python",
      "code": "def add(a, b):\n    return a + b"
    },
    {
      "id": 3,
      "language": "Python",
      "code": "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    def area(self):\n        return 3.14 * self.radius ** 2"
    },
    {
      "id": 4,
      "language": "JavaScript",
      "code": "console.log('Hello, World!');"
    },
    {
      "id": 5,
      "language": "JavaScript",
      "code": "function multiply(a, b) {\n    return a * b;\n}"
    },
    {
      "id": 6,
      "language": "JavaScript",
      "code": "const square = num => num * num;"
    },
    {
      "id": 7,
      "language": "Java",
      "code": "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}"
    },
    {
      "id": 8,
      "language": "Java",
      "code": "public class Rectangle {\n    private int width;\n    private int height;\n\n    public Rectangle(int width, int height) {\n        this.width = width;\n        this.height = height;\n    }\n\n    public int getArea() {\n        return width * height;\n    }\n}"
    }
];

// GET all users (not needed)
app.get('/users', (req, res) => {
    res.json(users);
});

// GET a single user by ID (not needed)
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(user => user.id === userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
});

// POST endpoint to authenticate a user
app.post('/user', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' }); // if theres no email or password, throws error message
  }

  // process to hash (encrypt) the password
  const saltRounds = 10; // sets salt to 10 
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword, // stores the hashed password
    };

    users.push(newUser);
    res.status(201).json({ message: 'User successfully created' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user by email
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Send token to user
    res.json({ token });
});

// POST endpoints to create a new snippet
app.post('/snippets', verifyToken, (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    const encryptedCode = encrypt(code); // addition to encrypt from workshop 2

    const newSnippet = {
        id: snippets.length + 1,
        language,
        code: encryptedCode, // addition to encrypt from workshop 2
    };

    snippets.push(newSnippet);
    res.status(201).json(newSnippet);
});

// GET endpoints to retrieve all snippets
app.get('/snippets', verifyToken, (req, res,) => {
    const { language } = req.query;

    const decryptedSnippet = snippets.map(snippet => ({
        id: snippet.id,
        language: snippet.language,
        code: decrypt(snippet.code.encryptedData, snippet.code.iv) // addition to decrypt from workshop 2  
    }));

    if (language) {
        const filterSnippets = snippets.filter(snippet => 
        snippet.language.toLocaleLowerCase() === language.toLocaleLowerCase());
        return res.json(filterSnippets);
    }

    res.json(decryptedSnippet);
});

// GET a single snippet by ID
app.get('/snippets/:id', (req, res) => {
    const { id } = req.params;
    const snippet = snippets.find(snippet => snippet.id === parseInt(id, 10));

    if (!snippet) {
        return res.status(404).json({ message: 'Snippet not found' });
    }

    const decryptedSnippet = {
        id: snippet.id,
        language: snippet.language,
        code: decrypt(snippet.code.encryptedData, snippet.code.iv) // addition to decrypt from workshop 2  
    };

    res.json(decryptedSnippet);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
