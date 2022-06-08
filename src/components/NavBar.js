import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import './NavBar.css';
import { useNavigate } from "react-router";
import { useUserAuth } from "../context/UserAuthContext";
import logo from "../image/Travel-Journal.png";
import { doc, getDoc } from 'firebase/firestore';
import { db } from "../db";
import { Button, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const NavBar = ({ userMode, checkLogin }) => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const { logOut, user } = useUserAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Get username from users
  useEffect(() => {
    if (!(userMode && user)) { return; }
    const userRef = doc(db, 'users', user.uid);
    getDoc(userRef).then(docSnap => {
      setLoading(false);
      if (docSnap.exists()) {
        // store in state
        setUsername(docSnap.data());
      } else {
        // show error
        return <p>Cannot get user's info. Please try again.</p>;
      }
    });
  },[user, userMode]);

  if (loading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setOpen(false);
      checkLogin(false);
      navigate("/");
    } catch (error) {
      return <p>{error.message}</p>;
    }
  };

  return (
		<nav className="navbar">
			<Link to="/" className="nav-logo">
        <img className='nav-img' src={logo} alt='logo' />
        Travel Journal
      </Link>
			<div onClick={()=>setOpen(!open)} className="nav-icon">
				{open ? <FiX /> : <FiMenu />}
			</div>
      {userMode? (
        <ul className={open ? 'nav-links active' : 'nav-links'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={()=>setOpen(false)}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/userHome" className="nav-link" onClick={()=>setOpen(false)}>My Posts</Link>
          </li>
          <li className="nav-item">
            <Link to="/favoritePost" className="nav-link" onClick={()=>setOpen(false)}>My Favorite Posts</Link>
          </li>
          <li className="nav-item">
            <Button onClick={handleLogout} variant="primary" size="sm">Log out</Button>
            <div className='nav-text'>{username.username}</div>
          </li>
        </ul>
        ):(
          <ul className={open ? 'nav-links active' : 'nav-links'}>
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={()=>setOpen(false)}>Home</Link>
            </li>
    
            <li className="nav-item">
              <Link to="/login" className="nav-link" onClick={()=>setOpen(false)}>
                Login
              </Link>
            </li>
          </ul>
        )}
		</nav>
  )
}

NavBar.propTypes = {
  userMode: PropTypes.bool.isRequired,
  checkLogin: PropTypes.func.isRequired
}

export default NavBar
