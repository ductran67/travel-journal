import { useState, useEffect } from "react";
import { db } from "./db";
import {
  query,
  orderBy,
  onSnapshot,
  collectionGroup,
} from "firebase/firestore";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserHome from "./pages/UserHome";
import PostDetail from "./pages/PostDetail";
import FavoritePost from "./pages/FavoritePost";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Spinner from 'react-bootstrap/Spinner';
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
function App() {
  // Define vars to collect post's data from firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [posts, setPosts] = useState([]);
  // Define the signin state hook
  const [signIn, setSignIn] = useState(false);
  const postsRef = collectionGroup(db, "posts");
  const postsQuery = query(postsRef, orderBy("postedDate", "desc"));

  useEffect(() => {
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
        console.log(reason);
        setError(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <p>An error occurred, please try again.</p>
  };

  if (loading) {
      return (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
  };

  // this function is used to set state of sigin hook
  const checkUserSignIn = (loginStatus) => {
    // console.log(loginStatus);
    setSignIn(loginStatus);
  };

  return (
    <Router>
      <UserAuthContextProvider>
        <NavBar userMode={signIn} checkLogin={checkUserSignIn} />
        <Routes>
          <Route path="/" element={<Home postList={posts} />} />
          <Route path="/login" element={<Login checkLogin={checkUserSignIn} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/userHome" element={<UserHome />} />
          <Route path="/favoritePost" element={<FavoritePost />} />
          <Route path="/postDetail/:id" element={<PostDetail userMode={signIn} />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
        <Footer />
      </UserAuthContextProvider>
    </Router>
  );
}

export default App;
