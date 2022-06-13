import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { db } from '../db';
import PropTypes from 'prop-types';

const Post = ({ post, showUsername, fromFavoritePostPage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState([]);
  useEffect(() => {
    // Get the post's user info
    const userRef = doc(db, 'users', post.data.userId);
    getDoc(userRef).then(docSnap => {
        setLoading(false);

        if (docSnap.exists()) {
            // store in state
            setUser(docSnap.data());
        } else {
            // show error
            setError(true);
        }
    });
  }, [post.data.userId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error, the user may not exist!</p>;
  }

  return (
    <Card className='mb-2'>
      <Link to={fromFavoritePostPage ? `/postDetail/${post.postId}`: `/postDetail/${post.id}`}>
        {post.data.image ? <Card.Img src = {post.data.image} alt={post.data.title} className="w-100" /> : ''}
      </Link>

      <Card.Body>
        <Link to={fromFavoritePostPage? `/postDetail/${post.postId}`: `/postDetail/${post.id}`}>
          <Card.Title>{post.data.title}</Card.Title>
        </Link>
        <Card.Text>
          {post.data.postedDate ? `Posted date: ${post.data.postedDate.toDate().toLocaleDateString()}`: ''} 
          {showUsername ? ` - Author: ${user.username}` : ''}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
// Define proptypes for post, showUsername, fromFavoritePostPage
Post.propTypes = {
  post: PropTypes.object.isRequired,
  showUsername: PropTypes.bool.isRequired,
  fromFavoritePostPage: PropTypes.bool.isRequired,
}

export default Post
