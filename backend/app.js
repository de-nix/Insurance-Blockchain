const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors'); // Import the cors module


const authRoutes = require('./routes/auth');
const {users} = require("./routes/auth");


const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

app.get('/users', (req, res) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add auth routes
app.use('/auth', authRoutes.router);

module.exports = app;
