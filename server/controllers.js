const request = require('request');
const db = require('../database/index');

const getEvents = async (token, callback) => {
  const options = {
    method: 'GET',
    url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    qs: {
      access_token: token, singleEvents: true, orderBy: 'startTime',
    },
  };
  await request(options, (error, response, body) => {
    if (error) { console.log(`Error regarding GET request to google-calendar API: ${error}`); }
    callback(body);
  });
};

const addEvent = async (id, event, callback) => {
  await db.User.findOne({ googleId: id }, async (err, user) => {
    const existingEvent = user.events.reduce((doesExist, e) => {
      if (e.title === event.title && e.description === event.description) {
        doesExist = true;
      }
      return doesExist;
    }, false);
    if (!existingEvent) {
      const newEvent = new db.IEvent({
        title: event.title || '',
        category: event.category || '',
        date: event.date || 'you will know when the time is right',
        description: event.description || '',
        isComplete: event.isComplete || false,
      });
      user.events.push(newEvent);
      await user.save();
    }
    callback(user);
  });
};

const updateEvent = async (id, event, callback) => {
  await db.User.findOne({ googleId: id }, async (err, user) => {
    user.events.forEach((e) => {
      if (e.description === event.description) {
        if (event.title) { e.title = event.title; }
        if (event.category) { e.category = event.category; }
        if (event.date) { e.date = event.date; }
        if (event.feedback) {
          const newFeedback = new db.Feedback({
            pros: event.feedback.pros.reduce((allPros, pro) => {
              allPros += `\n ${pro}`;
              return allPros;
            }, ''),
            cons: event.feedback.cons.reduce((allCons, con) => {
              allCons += `\n ${con}`;
              return allCons;
            }, ''),
            journal: event.feedback.journal,
          });
          e.feedback.push(newFeedback);
          e.isComplete = true;
        }
        user.save();
      }
    });
  });
};

const removeEvent = (currentUserId, eventId) => {
  db.User.findOne({ googleId: currentUserId }, (error, user) => {
    if (error) {
      throw error;
    } else {
      user.events.id(eventId).remove();
      user.save((err) => {
        if (err) {
          throw err;
        } else {
          console.log('event removed!');
        }
      });
    }
  });
};

const getEmail = async (id, callback) => {
  await db.User.findOne({ googleId: id }, async (err, user) => {
    callback(user.email);
  });
};

const fetchUpcomingEvents = (currentUserId, callback) => {
  // find user model that matches current user's google ID
  db.User.findOne({ googleId: currentUserId }, (error, user) => {
    if (error) {
      callback(error, null);
    } else {
      // go into their events sub-collection and find all events where isComplete: false
      const events = user.events.filter(event => event.isComplete === false);
      callback(null, events);
    }
  });
};

const fetchPastEvents = (currentUserId, callback) => {
  // find user model that matches current user's google ID
  db.User.findOne({ googleId: currentUserId }, (error, user) => {
    if (error) {
      callback(error, null);
    } else {
      // go into their events sub-collection and find all events where isComplete: true
      const events = user.events.filter(event => event.isComplete === true);
      callback(null, events);
    }
  });
};

module.exports.getEvents = getEvents;
module.exports.addEvent = addEvent;
module.exports.getEmail = getEmail;
module.exports.updateEvent = updateEvent;
module.exports.removeEvent = removeEvent;
module.exports.fetchUpcomingEvents = fetchUpcomingEvents;
module.exports.fetchPastEvents = fetchPastEvents;
