import React from 'react';

const CommentList = ({ comments }) => {
  const contentByStatus = {
    pending: 'This comment is awaiting moderation',
    rejected: 'This comment has been rejected',
  };

  const renderedComments = comments.map(({ id, content, status }) => {
    return <li key={id}>{contentByStatus[status] || content}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
