import { db } from "../db";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore";
import { Button, Container, Spinner } from "react-bootstrap";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) {
      return
    }
    const userRef = doc(db, "users", userId);
    getDoc(userRef).then(docSnap => {
      setLoading(false);
      if (docSnap.exists()) {
        // store in state
        setUserProfile(docSnap.data());
      } else {
        // show error
        setError(true);
      }
    });

  }, [userId]);

  if (error) {
    return <p>Error, the user may not exist!</p>;
  };

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  };

  return (
    <Container style={{ width: "400px" }}>
      <div className="p-3 box">
        <h3 className="mb-3 text-center">My profile</h3>
          <div className="pb-2">
            Display name: {userProfile.username}
          </div>
          <div className="pb-3">
            Email: {userProfile.email}
          </div>
  
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="Submit"
              onClick={() => navigate('/userHome')}
            >
              Back to My Posts page
            </Button>
          </div>
        
      </div>
    </Container>
  )
}

export default Profile
