const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const loginRouter = require('./Components/Account/Login/Login');
const signupRouter = require('./Components/Account/Signup/Signup');
const profileRouter = require('./Components/Account/Profile/Profile');
const UserMNGMRouter =require('./Components/Admin/UserMNGM/UserMNGM');
const newmovieRouter =require('./Components/Movie/ListMovie/Newmovie');
const CategoryMovieRouter = require('./Components/Movie/ListMovie/CategoryMovie');
const TypeMovieRouter = require('./Components/Movie/ListMovie/TypeMovie');
const DetailMovieRouter = require('./Components/Movie/DetailMovie/DetailMovie');
const app = express();
const port = 4000;

app.use(session({
  genid: (req) => {
    return uuidv4(); 
  },
  secret: 'as63d1265qw456q41rf32ds1g85456e1r32w1r56qr41_qwe1qw56e42a30s0', 
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));
app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/signup', signupRouter);
app.use('/api/profile', profileRouter);
app.use('/api/UserMNGM', UserMNGMRouter);
app.use('/api/Movie', newmovieRouter);
app.use('/api/category-movie', CategoryMovieRouter);
app.use('/api/type-movie', TypeMovieRouter);
app.use('/api/phim', DetailMovieRouter);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});