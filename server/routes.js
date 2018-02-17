const router = require('express').Router();
const passport = require('passport');
const path = require('path');
const controller = require('./controllers');

router.get(
  '/auth/google',
  passport.authenticate('google', {
    session: false,
    accessType: 'offline',
    approvalPrompt: 'force',
  }),
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/',
  }),
);

// allows user to refresh page but gets rid of React component functionality?
// router.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/../react-client/dist/index.html'), (error) => {
//     if (error) {
//       res.status(500).send(error);
//     }
//   });
// });

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/api/isAuthenticated', (req, res) => {
  const isLoggedIn = !!req.user;

  res.send(isLoggedIn);
});

router.get('/api/getCurrentUser', (req, res) => {
  res.send(req.user.firstName);
});

router.get('/api/upcomingEvents', (req, res) => {
  const currentUserId = req.user.googleId;
  // const currentUserId = req.query.googleId; // for testing in Postman
  controller.fetchUpcomingEvents(currentUserId, (error, events) => {
    if (error) {
      console.error(error);
    } else {
      res.send(events);
    }
  });
});

router.get('/api/pastEvents', (req, res) => {
  const currentUserId = req.user.googleId;
  const category = req.query.category ? req.query.category : null;
  // const currentUserId = req.query.googleId; // for testing in Postman
  controller.fetchPastEvents(currentUserId, category, (error, events) => {
    if (error) {
      console.error(error);
    } else {
      res.send(events);
    }
  });
});

router.post('/api/addEvent', async (req, res) => {
  await controller.addEvent(req.user.googleId, req.body.event, () => {
    res.send();
  });
});

router.post('/api/addEventToGoogleCal', async (req, res) => {
  await controller.addEventToGoogleCal(req.user.token, req.body.event, () => {
    res.send();
  });
});

router.post('/api/updateEvent', async (req, res) => {
  await controller.updateEvent(req.user.googleId, req.body.event, () => {
    res.send();
  });
});

router.post('/api/removeEvent', (req, res) => {
  const currentUserId = req.user.googleId;
  const { eventId } = req.body;
  controller.removeEvent(currentUserId, eventId);
  res.end();
});

router.post('/api/addReview', async (req, res) => {
  await controller.addReview(req.user.googleId, req.body.feedback, req.body.event, (err) => {
    if (err) {
      console.error(err);
    }
    res.send();
  });
});

router.get('/api/getReview', (req, res) => {
  const currentUserId = req.user.googleId;
  // const currentUserId = req.query.googleId; // for testing in Postman
  const { eventId } = req.query;

  controller.fetchReview(currentUserId, eventId, (error, review) => {
    if (error) {
      console.error(error);
    } else {
      res.send(review);
    }
  });
});

router.get('/api/getEmail', async (req, res) => {
  await controller.getEmail(req.user.googleId, (email) => {
    res.send(email);
  });
});


module.exports = router;
