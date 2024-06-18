const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const users = [
  {
    id: 1,
    username: 'insurer1',
    password: 'insurer1',
    address: '0x4a0Cd571f028E56EfE998e869C5073eF24c54F12',
    role: 'insurer',
  },
  {
    id: 2,
    username: 'insurer2',
    password: 'insurer2',
    address: '0x6cE750723e5A76E0DC420806b4D2228f5b0211d8',
    role: 'insurer',
  },  {
    id: 3,
    username: 'insured1',
    password: 'insured1',
    address: '0x021CC2932592c2597685310b8EaB77918F028927',
    role: 'insured',
  }, {
    id: 4,
    username: 'insured2',
    password: 'insured2',
    address: '0xf8a9BdF9CEf26941469eDE9Cad802C19478A5965',
    role: 'insured',
  },
  {
    id: 5,
    username: 'insured3',
    password: 'insured3',
    address: '0x63b701cfE740452dB053f0C373C5a61C4376A27c',
    role: 'insured',
  },
  {
    id: 6,
    username: 'insured4',
    password: 'insured4',
    address: '0xAE42B257ed4E235AC51Cedff933Fd2Eee73998de',
    role: 'insured',
  },
];
router.post('/register', (req, res) => {
  const { username, password, role, address, privateKey } = req.body;

  if (!username || !password || !role || !address || !privateKey) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    address,
    privateKey,
    role,
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const user = users.find(
      (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, 'secret', {
    expiresIn: '1h',
  });

  res.status(200).json({ user: {role: user.role, username: user.username, address: user.address, privateKey: user.privateKey}, message: 'Logged in successfully', token });
});

module.exports = {router, users};
