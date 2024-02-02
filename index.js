const express = require('express');
const cors = require('cors');
const loginRouter = require('./Components/Account/Login/Login');
const signupRouter = require('./Components/Account/Signup/Signup');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/signup', signupRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});