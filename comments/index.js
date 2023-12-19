const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { randomBytes } = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  const { id } = req.params;

  res.send(commentsByPostId[id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const { content } = req.body;
  const { id: postId } = req.params;

  const comments = commentsByPostId[postId] || [];
  const newComment = {
    id: randomBytes(4).toString('hex'),
    content,
    status: 'pending',
  };

  commentsByPostId[postId] = [...comments, newComment];

  // emit event to event bus
  await axios
    .post('http://event-bus-srv:4005/events', {
      type: 'CommentCreated',
      data: { ...newComment, postId },
    })
    .catch((err) => {
      console.log('Error: Event Bus', err.message);
    });

  res.status(201).send(commentsByPostId[postId]);
});

app.post('/events', async (req, res) => {
  console.log('Event Received:', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { id, content, postId, status } = data;

    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => comment.id === id);

    comment.status = status;

    await axios
      .post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: {
          id,
          content,
          postId,
          status,
        },
      })
      .catch((err) => {
        console.log('Error: Event Bus', err.message);
      });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log('Listening on 4001');
});
