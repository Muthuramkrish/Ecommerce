import React, { useState, useRef, useEffect } from 'react';
import './LoginPage.css';

const initialForm = {
  signUp: { name: '', email: '', password: '', terms: false },
  signIn: { email: '', password: '' },
};

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('users')) || [];
  } catch {
    return [];
  }
}

function saveUser(name, email, password) {
  let users = getStoredUsers();
  if (users.find((u) => u.email === email)) return false;
  users.push({ name, email, password, createdAt: new Date().toISOString() });
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('lastUser', email);
  return true;
}

function authenticateUser(email, password) {
  let users = getStoredUsers();
  let user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('lastUser', email);
    return user;
  }
  return null;
}

function getLastUser() {
  try {
    const lastUserEmail = localStorage.getItem('lastUser');
    if (lastUserEmail) {
      const users = getStoredUsers();
      return users.find((user) => user.email === lastUserEmail);
    }
    return null;
  } catch {
    return null;
  }
}

const LoginPage = ({ onLoginSuccess }) => {
  const [active, setActive] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [signUpMsg, setSignUpMsg] = useState({ msg: '', error: false });
  const [signInMsg, setSignInMsg] = useState({ msg: '', error: false });
  const [showSignUpPwd, setShowSignUpPwd] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);
  const signInEmailRef = useRef();
  const signInPwdRef = useRef();

  useEffect(() => {
    const lastUser = getLastUser();
    if (lastUser) {
      setForm((f) => ({ ...f, signIn: { ...f.signIn, email: lastUser.email } }));
    }
  }, []);

  // On mobile, allow deep-linking to the Sign Up panel via #signup or ?mode=signup
  useEffect(() => {
    try {
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      if (isMobile && (hash === '#signup' || searchParams.get('mode') === 'signup')) {
        setActive(true);
      }
    } catch {}
  }, []);

  // Email suggestions removed on request

  const handleSignUpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      signUp: { ...f.signUp, [name]: type === 'checkbox' ? checked : value },
    }));
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, signIn: { ...f.signIn, [name]: value } }));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const { name, email, password, terms } = form.signUp;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setSignUpMsg({ msg: 'All fields are required.', error: true });
      return;
    }
    // Password validation
    const passwordRules = [
      { regex: /.{8,}/, message: 'Password must be at least 8 characters.' },
      { regex: /[A-Z]/, message: 'Password must contain at least one uppercase letter.' },
      { regex: /[a-z]/, message: 'Password must contain at least one lowercase letter.' },
      { regex: /[0-9]/, message: 'Password must contain at least one number.' },
      { regex: /[^A-Za-z0-9]/, message: 'Password must contain at least one special character.' },
    ];
    for (const rule of passwordRules) {
      if (!rule.regex.test(password)) {
        setSignUpMsg({ msg: rule.message, error: true });
        return;
      }
    }
    if (!terms) {
      setSignUpMsg({ msg: 'Please accept the terms and conditions', error: true });
      return;
    }
    if (saveUser(name, email, password)) {
      setSignUpMsg({ msg: 'Registration successful! You can now sign in.', error: false });
      setForm((f) => ({ ...f, signUp: initialForm.signUp }));
      setTimeout(() => {
        setActive(false);
        setForm((f) => ({ ...f, signIn: { ...f.signIn, email } }));
        signInEmailRef.current && signInEmailRef.current.focus();
      }, 1500);
    } else {
      setSignUpMsg({ msg: 'User with this email already exists!', error: true });
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    const { email, password } = form.signIn;
    if (!email.trim() || !password.trim()) {
      setSignInMsg({ msg: 'Email and password are required.', error: true });
      return;
    }
    const user = authenticateUser(email, password);
    if (user) {
      setSignInMsg({ msg: 'Login successful! Welcome back.', error: false });
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      }, 1000);
    } else {
      setSignInMsg({ msg: 'Invalid email or password. Please try again.', error: true });
    }
  };

  // Suggestion click handler removed

  return (
    <div className="main-wrapper">
      <div className="image-section">
        <img src="/src/assets/login.png" alt="Template"/>
      </div>
      <div className={`container${active ? ' active' : ''}`} id="container">
        {/* SIGN UP PANEL */}
        <div className="sign-up">
          <form autoComplete="off" noValidate onSubmit={handleSignUp}>
            <h2>Create Account</h2>
            <div className="icons">
              <a href="#" className="icon"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-google"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
            </div>
            <span>or use email for registration</span>
            <input type="text" name="name" placeholder="Full Name" value={form.signUp.name} onChange={handleSignUpChange} required />
            <input type="email" name="email" placeholder="Email" value={form.signUp.email} onChange={handleSignUpChange} required />
            <div className="password-wrapper">
              <input type={showSignUpPwd ? 'text' : 'password'} name="password" placeholder="Password" value={form.signUp.password} onChange={handleSignUpChange} required />
              <span className="toggle-password" onClick={() => setShowSignUpPwd((v) => !v)}><i className={`fa-regular ${showSignUpPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></span>
            </div>
            <div className="terms">
              <input type="checkbox" id="signup-terms" name="terms" checked={form.signUp.terms} onChange={handleSignUpChange} required />
              <label htmlFor="signup-terms">I accept the terms and conditions</label>
            </div>
            <div className={`message${signUpMsg.error ? ' error-message' : ' success-message'}`} aria-live="polite" style={{ display: signUpMsg.msg ? 'block' : 'none' }}>{signUpMsg.msg}</div>
            <button type="submit">Sign Up</button>
          </form>
        </div>
        {/* SIGN IN PANEL */}
        <div className="sign-in">
          <form autoComplete="off" noValidate onSubmit={handleSignIn}>
            <h2>Sign In</h2>
            <div className="icons">
              <a href="#" className="icon"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-google"></i></a>
              <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
            </div>
            <span>or use email password</span>
            <div className="email-wrapper">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.signIn.email}
                onChange={handleSignInChange}
                required
                autoComplete="username"
                ref={signInEmailRef}
              />
            </div>
            <div className="password-wrapper">
              <input
                type={showSignInPwd ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.signIn.password}
                onChange={handleSignInChange}
                required
                autoComplete="current-password"
                ref={signInPwdRef}
              />
              <span className="toggle-password" onClick={() => setShowSignInPwd((v) => !v)}><i className={`fa-regular ${showSignInPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></span>
            </div>
            <a href="#">Forgot password</a>
            <div className={`message${signInMsg.error ? ' error-message' : ' success-message'}`} aria-live="polite" style={{ display: signInMsg.msg ? 'block' : 'none' }}>{signInMsg.msg}</div>
            <button type="submit">Sign In</button>
          </form>
        </div>
        {/* SIDE TOGGLE PANELS */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Hello again!</h1>
              <p>Please log in to pick up where you left off.</p>
              <button id="login" type="button" onClick={() => setActive(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hi there! New here?</h1>
              <p>Create an account to get started.</p>
              <button id="register" type="button" onClick={() => setActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;