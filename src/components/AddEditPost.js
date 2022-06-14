import { useState, useEffect, useRef } from "react";
import { db, storage } from "../db";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import Alert from 'react-bootstrap/Alert';
import { Card, Container, Form, Button } from "react-bootstrap";
import PropTypes from 'prop-types';

const AddEditPost = ({ userId, postId, returnAddForm }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [downloadURL, setDownloadURL] = useState("");
  const imageInputRef = useRef();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!postId) {
      // Reset all input fields
      setTitle('');
      setCity('');
      setCountry('');
      setContent('');
      setImage('');
      setImageURL('');
      setDownloadURL('');
      imageInputRef.current.value="";
      return
    }
    const getSinglePost = async () => {
      const postRef = doc(db, "users", userId, "posts", postId);
      const snapshot = await getDoc(postRef);

      if (snapshot.exists()) {
        setTitle(snapshot.data().title);
        setCity(snapshot.data().city);
        setCountry(snapshot.data().country);
        setContent(snapshot.data().content);
        setImageURL(snapshot.data().image);
      }
    };
    getSinglePost();
  }, [userId, postId]);

  useEffect(() => {
    const uploadFile = () => {
      const imageName = new Date().getTime() + image.name;
      const storageRef = ref(storage, imageName);
      uploadBytes(storageRef, image).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setDownloadURL(url);
        });
      });
    };
    image && uploadFile();
  }, [image]);
  useEffect(() => {
    if (!image || image.length < 1) return;
    setImageURL(URL.createObjectURL(image));
  }, [image]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postId) {
      try {
        const postsRef = collection(db, 'users', userId, 'posts');
        await addDoc(postsRef, {
          title, city, country, content, userId,
          image: downloadURL,
          postedDate: serverTimestamp()
        });
      } catch (error) {
        setError(error);
      }
    } else {
      try {
        const postsRef = doc(db, 'users', userId, 'posts', postId);
        await updateDoc(postsRef, {
          title, city, country, content, userId,
          image: downloadURL ? downloadURL : imageURL,
          postedDate: serverTimestamp()
        });
      } catch (error) {
        setError(error);
      }
    };

    // Reset all input fields
    setTitle('');
    setCity('');
    setCountry('');
    setContent('');
    setImage('');
    setImageURL('');
    setDownloadURL('');
    imageInputRef.current.value="";
    // Return AddPost Form
    returnAddForm();
  };

  return (
    <Container>
      <div className="pb-2 box">
        <h3 className="mb-2 title">{postId ? "Update Post" : "New Post"}</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicTitle">
            <Form.Control
              type="text"
              value={title}
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicCity">
            <Form.Control
              type="text"
              value={city}
              placeholder="City"
              onChange={(e) => setCity(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCountry">
            <Form.Control
              type="text"
              value={country}
              placeholder="Country"
              onChange={(e) => setCountry(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCountry">
            <Form.Control
              as="textarea"
              value={content}
              placeholder="Content"
              rows={10}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control
              type="file"
              accept='image/*'
              onChange={(e) => setImage(e.target.files[0])}
              ref={imageInputRef}
            />
          </Form.Group>
          <Form.Group controlId="formCard" className="mb-3">
            <Card>
              <Card.Img variant="top" src={imageURL} />
            </Card>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button variant="primary" type="Submit">
              {postId ? "Update Post" : "Add Post"}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  )
}

// Define props types for userId, postId, returnAddForm
AddEditPost.propTypes = {
  userId: PropTypes.string.isRequired,
  postId: PropTypes.string,
  returnAddForm: PropTypes.func.isRequired
}

export default AddEditPost
