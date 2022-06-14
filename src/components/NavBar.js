import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
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
        setUsername(docSnap.data().username);
      } else {
        // show error
        return <p>Cannot get username. Please try again.</p>;
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
			<NavLink to="/" className="nav-logo">
        <img className='nav-img' src={logo} alt='logo' />
        Travel Journal
      </NavLink>
			<div onClick={()=>setOpen(!open)} className="nav-icon">
				{open ? <FiX /> : <FiMenu />}
			</div>
      {userMode? (
        <ul className={open ? 'nav-links active' : 'nav-links'}>
          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'active nav-link' : 'inactive nav-link')}
              onClick={()=>setOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/userHome"
              className={({ isActive }) => (isActive ? 'active nav-link' : 'inactive nav-link')}
              onClick={()=>setOpen(false)}
            >
              My Posts
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/favoritePost"
              className={({ isActive }) => (isActive ? 'active nav-link' : 'inactive nav-link')}
              onClick={()=>setOpen(false)}
            >
              My Favorite Posts
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`/profile/${user.uid}`}
              className={({ isActive }) => (isActive ? 'active nav-link' : 'inactive nav-link')}
              onClick={()=>setOpen(false)}
            >
              My Profile
            </NavLink>
          </li>
          <li className="nav-item">
            <Button onClick={handleLogout} variant="primary" size="sm">Log out</Button>
            <div className='nav-text'>{username}</div>
          </li>
        </ul>
        ):(
          <ul className={open ? 'nav-links active' : 'nav-links'}>
            <li className="nav-item">
              <NavLink to="/" className="nav-link" onClick={()=>setOpen(false)}>Home</NavLink>
            </li>
    
            <li className="nav-item">
              <NavLink to="/login" className="nav-link" onClick={()=>setOpen(false)}>
                Login
              </NavLink>
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
