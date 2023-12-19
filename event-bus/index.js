const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const events = [];

app.post('/events', (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post('http://posts-clusterip-srv:4000/events', event).catch((err) => {
    console.log('Error: Post Service', err.message);
  }); // posts

  axios
    .post('http://comments-clusterip-srv:4001/events', event)
    .catch((err) => {
      console.log('Error: Comments Service', err.message);
    }); // comments

  axios.post('http://query-clusterip-srv:4002/events', event).catch((err) => {
    console.log('Error: Query Service', err.message);
  }); // query

  axios
    .post('http://moderation-clusterip-srv:4003/events', event)
    .catch((err) => {
      console.log('Error: Moderation Service', err.message);
    }); // moderation

  res.send({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log('Listening on 4005');
});
