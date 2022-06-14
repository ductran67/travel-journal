import { useState, useEffect } from "react";
import { db } from "../db";
import {
  query,
  orderBy,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Post from "../components/Post";
import { useUserAuth } from "../context/UserAuthContext";
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import AddEditPost from "../components/AddEditPost";
import ImageSlideShow from "../components/ImageSlideShow";

const UserHome = () => {
  const { user } = useUserAuth();
  const [posts, setPosts] = useState([]);
  const [postId, setPostId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggleDisplay, setToggleDisplay] = useState(false);
  const [toggleSlideShow, setToggleSlideShow] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const postsCollectionRef = collection(db, "users", user.uid, "posts");
    const postsQuery = query(postsCollectionRef, orderBy("postedDate", "desc"));
    const unsubscribe = onSnapshot(
      postsQuery,
      snapshot => {
        setPosts(snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        })));
        setLoading(false);
      },
      reason => {
        // console.log(reason);
        setError(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, [user]);

  if (error) {
    return <p>An error occurred, please try again.</p>
  }

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  };

  const toggleAddPostForm = () => {
    setToggleDisplay(!toggleDisplay);
    if (toggleDisplay) {
      setPostId(null);
    }

  };

  const updateForm = (postId) => {
    setToggleDisplay(true);
    setPostId(postId);
   };

  const returnAddForm = () => {
    // Reset postId value 
    setPostId(null);
  };

  // Delete post function
  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const postRef = doc(db, "users", user.uid, "posts", postId);
        await deleteDoc(postRef);
      } catch (error) {
        setError(error);
      }
    };
  };

  return (
    <Container fluid>
      {/* Rendering button showing/hiding slide show */}
      <div className={toggleDisplay? "hide" : "right__side mt-2"}>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={()=> setToggleSlideShow(!toggleSlideShow)}
        >
          {toggleSlideShow? "Hide Slide Show" : "Show Slide Show"}
        </Button>
      </div>
      <Row>
        {/* Post Form area */}
        <Col className={toggleDisplay ? 'show' : 'hide'}>
          {/* AddEditPost Component */}
          <AddEditPost userId = {user.uid} postId={postId} returnAddForm = {returnAddForm} />
        </Col>
        {/* User's Post-List area */}
        <Col>
          <h3 className='title'>My Post-List</h3>
          <Button variant="outline-primary" onClick={()=> toggleAddPostForm()}>
            {toggleDisplay? "Close Add New Post Form" : "Add New Post"}
          </Button>
          {posts.length > 0 ? (
            <>
              {posts.map((post) => 
                <div key={post.id} className='pb-2 mb-2 mt-2 bottom__line'>
                  <Post post={post} showUsername={false} fromFavoritePostPage={false} />
                  {/* Update Button */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => updateForm(post.id)}
                  >
                    Update
                  </Button >{' '}
                  {/* Delete button */}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </>
            ) : ('')
          }

        </Col>
        {/* Post Form */}
        <Col className={!toggleDisplay && toggleSlideShow ? 'show' : 'hide'}>
          <h3 className='title'>My Posts Image Slide Show</h3>
          {posts.length > 0 ? (<ImageSlideShow posts={posts} />):('')}
        </Col>
      </Row>
    </Container>
  )
}

export default UserHome
