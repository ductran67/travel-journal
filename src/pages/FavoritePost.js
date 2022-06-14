import { useState, useEffect } from "react";
import { db } from "../db";
import {
  query,
  orderBy,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  collectionGroup,
  getDoc,
} from "firebase/firestore";
import Post from "../components/Post";
import { useUserAuth } from "../context/UserAuthContext";
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import ImageSlideShow from "../components/ImageSlideShow";

const FavoritePost = () => {
  const { user } = useUserAuth();
  const [myFavoritePosts, setMyFavoritePosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggleSlideShow, setToggleSlideShow] = useState(true);

  // Get my favorite posts data 
  useEffect(() => {
    if (!user) {
      return;
    }
    // Define query to retrieve my favorite posts data from firestore database
    const myFavoritePostsRef = collection(db, "users", user.uid, "myFavoritePosts");
    const myFavoritePostsQuery = query(myFavoritePostsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      myFavoritePostsQuery,
      snapshot => {
        // Reset myFavoritePostArray
        let myFavoritePostArray = [];
        // Get postId & userId from myFavoritePosts collection
        snapshot.docs.forEach((myFP) => {
          // Get data from posts collection
          if (myFP.data().postId && myFP.data().userId) {
            const postRef = doc(db, "users", myFP.data().userId, "posts", myFP.data().postId);
            getDoc(postRef).then(docSnap => {

              if (docSnap.exists()) {
                myFavoritePostArray = [...myFavoritePostArray, {id: myFP.id, postId: myFP.data().postId, data: docSnap.data()}]
                setMyFavoritePosts(myFavoritePostArray);
              } else {
                // show error
                setError(true);
              }
            });
          };
        });
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

  useEffect(() => {
    // Get all posts
    const postsRef = collectionGroup(db, "posts");
    const postsQuery = query(postsRef, orderBy("postedDate", "desc"));
    // Get posts data
    const unsubscribe = onSnapshot(
      postsQuery,
      snapshot => {
        setPosts(snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        })));
        let user_post = [];
        // Get the pair of each userId & postId from firestore
        snapshot.docs.forEach(doc => {
          user_post.push({ userId: doc.data().userId, postId: doc.id });
        });
        // and store them to the local storage
        localStorage.setItem("user_post_data",JSON.stringify(user_post));
        setLoading(false);
      },
      reason => {
        setError(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

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

  const deleteMyFavoritePost = async (myFPId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const myFavoritePostRef = doc(db, "users", user.uid, "myFavoritePosts", myFPId);
        await deleteDoc(myFavoritePostRef);
        setMyFavoritePosts(myFavoritePosts.filter(item => item.id !== myFPId));
      } catch (error) {
        setError(true);
      }
    };
  };

  return (
    <Container fluid>
      {/* Rendering button showing/hiding slide show */}
      <div className="right__side mt-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={()=> setToggleSlideShow(!toggleSlideShow)}
        >
          {toggleSlideShow? "Hide Slide Show" : "Show Slide Show"}
        </Button>
      </div>

      <Row>
        <Col>
          <h3 className='title'>My favorite Posts</h3>

          {myFavoritePosts.length > 0 ? (
            <>
              {myFavoritePosts.map((post) => 
                <div key={post.id} className='pb-2 mb-2 bottom__line'>
                  <Post post={post} showUsername={true} fromFavoritePostPage={true} />
                  {/* Remove button */}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deleteMyFavoritePost(post.id)}
                  >
                    Remove from My Favorite Posts
                  </Button>
                </div>
              )}
            </>
            ) : ('There is no favorite post here.')
          }

        </Col>
        {/* Image Slide Show area */}
        <Col className={toggleSlideShow? "show":"hide"}>
          <h3 className='title'>Unforgettable Places Slide Show</h3>
          {posts.length > 0 ? (<ImageSlideShow posts={posts} />):('')}
        </Col>
      </Row>
    </Container>
  )
}

export default FavoritePost
