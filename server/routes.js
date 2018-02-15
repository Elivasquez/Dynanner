import Login from '../react-client/src/components/login/index';
import Header from '../react-client/src/header';
import Home from '../react-client/src/components/homepage/index';
import AddEvent from '../react-client/src/components/addEvent/index';
import ReviewEvent from '../react-client/src/components/reviewEvent/index';
import PastEvents from '../react-client/src/components/pastEvents/index';
import template from '../react-client/template';

const router = require('express').Router();
const request = require('request');
const passport = require('passport');
const controller = require('./controllers');
const db = require('../database/helpers');
const React = require('react');
const { renderToString } = require('react-dom/server');

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope:
      ['https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.profile.emails.read',
        'https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
    successRedirect: '/homepage',
    failureRedirect: '/login',
  }),
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/homepage',
    failureRedirect: '/login',
  }),
);

router.get('/', (req, res) => {
  const isLoggedIn = !!req.user;

  if (isLoggedIn) {
    res.redirect('/homepage');
  } else {
    res.redirect('/login');
  }
});

router.get('/login', (req, res) => {
  const isLoggedIn = !!req.user;
  if (isLoggedIn) {
    res.redirect('/homepage');
  } else {
    const appString = renderToString(React.createElement(Login));
    res.send(template({
      body: appString,
      title: 'Welcome to Dynanner',
    }));
  }
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

router.get('/homepage', (req, res) => {
  const isLoggedIn = !!req.user;
  if (isLoggedIn) {
    const currentUser = req.user.firstName;
    const currentUserId = req.user.googleId;
    const initialState = { currentUser, currentUserId };
    const homeComponent = React.createElement(Home);
    const appString = renderToString(React.createElement(Header, initialState, homeComponent));
    res.send(template({
      body: appString,
      title: 'Your Dynanner',
      initialState: JSON.stringify(initialState),
    }));
  } else {
    res.redirect('/login');
  }
});

router.get('/addEvent', (req, res) => {
  const isLoggedIn = !!req.user;
  if (isLoggedIn) {
    const addEventComponent = React.createElement(AddEvent);
    const appString = renderToString(React.createElement(Header, null, addEventComponent));
    res.send(template({
      body: appString,
      title: 'Add an Event',
    }));
  } else {
    res.redirect('/login');
  }
});

router.get('/pastEvents', (req, res) => {
  const isLoggedIn = !!req.user;
  if (isLoggedIn) {
    const pastEventsComponent = React.createElement(PastEvents);
    const appString = renderToString(React.createElement(Header, null, pastEventsComponent));
    res.send(template({
      body: appString,
      title: 'Your Past Events',
    }));
  } else {
    res.redirect('/login');
  }
});

router.get('/reviewEvent', (req, res) => {
  const isLoggedIn = !!req.user;
  if (isLoggedIn) {
    const reviewEventComponent = React.createElement(ReviewEvent);
    const appString = renderToString(React.createElement(Header, null, reviewEventComponent));
    res.send(template({
      body: appString,
      title: 'Review Your Event',
    }));
  } else {
    res.redirect('/login');
  }
});

router.get('/api/upcomingEvents', (req, res) => {
  console.log(req);
  // const currentUserId = req.user.googleId;
  const currentUserId = req.query.googleId; // for testing in Postman
  db.fetchUpcomingEvents(currentUserId, (error, events) => {
    if (error) {
      console.error(error);
    } else {
      res.send(events);
    }
  });
});

router.post('/api/addEvent', (req, res) => {});

router.post('/api/reviewEvent', (req, res) => {});

module.exports = router;
