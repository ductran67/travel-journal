import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Alert, Button } from "react-bootstrap";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from "../db";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // await signUp(email, password);
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // console.log(res.user.uid);
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        timeStamp: serverTimestamp()
      });
      alert('You have signed up successful. Now you can login with your email and password.')
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }

  };

  return (
    <Container style={{ width: "400px" }}>
      <div className="p-4 box">
        <h3 className="mb-3 text-center">Sign Up</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Control
              type="text"
              value={username}
              placeholder="Display name"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              value={email}
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
              Sign up
            </Button>
          </div>
        </Form>
      </div>
      <div className="p-4 box mt-3 text-center">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </Container>
  );
}

export default Signup
