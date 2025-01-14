const express = require('express');
const app = express();

app.use(express.json());

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

// POST endpoints to create a new snippet
app.post('/snippets', (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    const newSnippet = {
        id: snippets.length + 1,
        language,
        code,
    };

    snippets.push(newSnippet);
    res.status(201).json(newSnippet);
});

// GET endpoints to retrieve all snippets
app.get('/snippets', (req, res,) => {
    const { language } = req.query;

    if (language) {
        const filterSnippets = snippets.filter(snippet => snippet.language.toLocaleLowerCase() === language.toLocaleLowerCase());
        return res.json(filterSnippets);
    }

    res.json(snippets);
});

// GET a single snippet by ID
app.get('/snippets/:id', (req, res) => {
    const { id } = req.params;
    const snippet = snippets.find(snippet => snippet.id === parseInt(id, 10));

    if (!snippet) {
        return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json(snippet);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
