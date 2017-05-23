import FB from 'fb';
import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import User from '../models/user_model';

dotenv.config({ silent: true });

export const signUp = (req, res, next) => {
  const username = req.body.username;

  // If the username field is blank, return a 422 error
  if (!username) {
    res.status(422).send('You must provide a username');
    return;
  }

  // If the username is taken, return a 409 error
  User.findOne({ username }, (err, data) => {
    if (err) {
      res.status(500).json({ err });
      return;
    } else if (data) {
      res.status(409).send('This email address is already registered');
      return;
    }

    const user = new User();
    user.username = req.body.username;
    user.wins = 0;
    user.losses = 0;
    user.pic = '';
    user.badges = [];
    user.roundsAsMafia = 0;
    user.roundsAsVillager = 0;
    user.roundsAsPolice = 0;
    user.roundsAsDoctor = 0;
    user.save((err) => {
      if (err) res.sendStatus(500);
    });
  });
};

export const authUser = (req, res) => {
  // res.send({ token: tokenForUser(req.body.token) });
  FB.api('/me', { access_token: req.body.token }, (response) => {
    User.findOne({ name: response.name }, (err, data) => {
      if (!err && !data) {
        const user = new User();
        user.name = response.name;
        user.facebookID = response.id;
        user.wins = 0;
        user.losses = 0;
        user.pic = '';
        user.badges = [];
        user.roundsAsMafia = 0;
        user.roundsAsVillager = 0;
        user.roundsAsPolice = 0;
        user.roundsAsDoctor = 0;
        user.save()
          .then(res.send({ token: tokenForFBID(response.id) }))
          .catch((error) => { console.log(error); });
      }
    });
  });
};

export const getUsers = (req, res) => {
  User.find({}).then((data) => {
    res.send(data);
  });
};

export const getUser = (req, res) => {
  User.findById(req.params.id).then((data) => {
    res.send(data);
  });
};

// encodes a new token for a user object
function tokenForFBID(FBID) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: FBID, iat: timestamp }, process.env.AUTH_SECRET);
}
