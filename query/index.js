const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const posts = {};
// structure of posts object
// {
//   '123': {
//     id: '123',
//     title: 'post title',
//     comments: [
//       { id: '123', content: 'comment content', status: 'pending' | 'approved' | 'rejected' },
//       ...
//     ],
//   },
//  ...
// };

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];

    if (post) {
      post.comments.push({ id, content, status });
    }
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;

    const post = posts[postId];

    const comment = post.comments.find((comment) => comment.id === id);

    comment.status = status;
    comment.content = content;
  }
};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log('Listening on 4002');

  await axios
    .get('http://event-bus-srv:4005/events')
    .then((res) => {
      for (let event of res.data) {
        console.log('Processing event:', event.type);

        handleEvent(event.type, event.data);
      }
    })
    .catch((err) => {
      console.log('Error: Query Service', err.message);
    });
});
