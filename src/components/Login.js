import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleButton from "react-google-button";
import { Container, Form, Alert, Button, Spinner } from "react-bootstrap";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db } from "../db";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import PropTypes from 'prop-types';

const Login = ({ checkLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  // const { user, logIn, googleSignIn } = useUserAuth();
  const navigate = useNavigate();

  // Check user function
  const checkUser = async (loggedUser) => {
    const userRef = doc(db, 'users', loggedUser.uid);
    await getDoc(userRef).then(docSnap => {
      setLoading(false);

      if (!docSnap.exists()) {
        setDoc(doc(db, "users", loggedUser.uid), {
          username: loggedUser.displayName ? loggedUser.displayName : loggedUser.email,
          email: loggedUser.email,
          timeStamp: serverTimestamp()
        });
      }
    });

    if (loading) {
      return (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // await logIn(email, password);
      const res = await signInWithEmailAndPassword(auth, email, password);
      checkLogin(true);
      // console.log(res.user.uid);
      checkUser(res.user);

      navigate("/userHome");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      // await googleSignIn();
      const googleAuthProvider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, googleAuthProvider);

      checkLogin(true);
      // console.log(res.user);
      checkUser(res.user);

      navigate("/userHome");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container style={{ width: "400px" }}>
      <div className="p-4 box">
        <h2 className="mb-3">Sign In</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="Submit">
              Log In
            </Button>
          </div>
        </Form>
        <hr />
        <div>
          <GoogleButton
            className="g-btn"
            type="dark"
            onClick={handleGoogleSignIn}
          />
        </div>
      </div>
      <div className="p-4 box mt-3 text-center">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </Container>
  );
}

Login.propTypes = {
  checkLogin: PropTypes.func.isRequired
}

export default Login
