import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Card, Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom"
import { useUserAuth } from "../context/UserAuthContext";
import { db } from "../db";
import PropTypes from 'prop-types';

const PostDetail = ({ userMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [userDetail, setUserDetail] = useState({});
  const [postDetail, setPostDetail] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Get user_post_data from local storage
  const user_post_data = JSON.parse(localStorage.getItem("user_post_data"));

  useEffect(() => {
    if (!id) { return }
    const user_post = user_post_data.filter(item => item.postId === id);
    const postRef = doc(db, "users", user_post[0].userId, "posts", id);
    const userRef = doc(db, "users", user_post[0].userId);
    // Get post detail info
    getDoc(postRef).then(docSnap => {
      setLoading(false);
      if (docSnap.exists()) {
        // store in state
        setPostDetail(docSnap.data());
      } else {
        // show error
        setError(true);
      }
    });
    // Get user detail info
    getDoc(userRef).then(docSnap => {
      setLoading(false);
      if (docSnap.exists()) {
        // store in state
        setUserDetail(docSnap.data());
      } else {
        // show error
        setError(true);
      }
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  };

  const addMyFavoritePost = async () => {
    // Check if the post exists in myFavoritePosts or not
    const myFavoritePostsQuery = query(
      collection(db, 'users', user.uid, 'myFavoritePosts'),
      where("postId", "==", id)
    );
    const querySnapshot = await getDocs(myFavoritePostsQuery);
    // Not found this post
    if (querySnapshot.empty) {
      try {
        const myFavoritePostsRef = collection(db, 'users', user.uid, 'myFavoritePosts');
        await addDoc(myFavoritePostsRef, {
            title: postDetail.title,
            city: postDetail.city,
            country: postDetail.country,
            content: postDetail.content,
            userId: postDetail.userId,
            image: postDetail.image,
            postedDate: postDetail.postedDate,
            postId: id,
            createdAt: serverTimestamp()
        });
      } catch (error) {
        return <p>{error.message}</p>;
      }
      alert('The task has been done. Please visit your favorire posts page.')
    } else {
      alert('This post has already been in your favorite posts.');
    }
  };

  if (error) {
    return <p>Error, the post/ user may not exist!</p>;
  };

  return (
    <Container fluid>
      <div className='title bottom__line'>Post Detail</div>
      <Row>
        <Col>
          <Card className='mb-2'>
            {postDetail.image ? <Card.Img src = {postDetail.image} alt={postDetail.title} /> : ''}
            <Card.Body>
              <Card.Title>{postDetail.title}</Card.Title>
              <Card.Text>
                {postDetail.postedDate ? `Posted date: ${postDetail.postedDate.toDate().toLocaleDateString()}`: ''} 
                {` - Author: ${userDetail.username}`}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card.Text>
            Location: {postDetail.city} - {postDetail.country}
          </Card.Text>
          <Card.Text>
            {postDetail.content} 
          </Card.Text>
        </Col>
      </Row>
      <Button variant="outline-primary" type="submit" onClick={()=> navigate('/')}>
        Back to Home Page
      </Button>{"  "}
      {userMode ? (
        <Button variant="outline-primary" type="submit" onClick={addMyFavoritePost}>
          Add to My Favorite Posts
        </Button>
        ) : ('')
      }

    </Container>
  )
}

PostDetail.propTypes = {
  userMode: PropTypes.bool.isRequired
}

export default PostDetail
