import React, { useState, useRef, useEffect } from 'react';
import './LoginPage.css';
import { signUpUser, signInUser } from "../api/user";  


const initialForm = {
  signUp: { name: '', email: '', password: '', terms: false },
  signIn: { email: '', password: '' },
};


const LoginPage = ({ onLoginSuccess }) => {
  const [active, setActive] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [signUpMsg, setSignUpMsg] = useState({ msg: '', error: false });
  const [signInMsg, setSignInMsg] = useState({ msg: '', error: false });
  const [showSignUpPwd, setShowSignUpPwd] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);
  const signInEmailRef = useRef();
  const signInPwdRef = useRef();
  const signUpPwdRef = useRef();

  const [showSignUpChecklist, setShowSignUpChecklist] = useState(false);
  const [signUpPwdFocused, setSignUpPwdFocused] = useState(false);

  const isValidEmail = (email) => {
    const value = String(email || '').trim();
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return emailRegex.test(value);
  };

  const passwordRules = [
    { id: 'len', regex: /.{8,}/, label: 'At least 8 characters' },
    { id: 'upper', regex: /[A-Z]/, label: 'At least one uppercase letter' },
    { id: 'lower', regex: /[a-z]/, label: 'At least one lowercase letter' },
    { id: 'num', regex: /[0-9]/, label: 'At least one number' },
    { id: 'special', regex: /[^A-Za-z0-9]/, label: 'At least one special character' },
  ];

  const evaluatePasswordRules = (password) => {
    return passwordRules.map((r) => ({ id: r.id, label: r.label, ok: r.regex.test(password || '') }));
  };
  const getUnmetPasswordRules = (password) => {
    return passwordRules
      .filter((r) => !r.regex.test(password || ''))
      .map((r) => ({ id: r.id, label: r.label }));
  };
  const areAllPasswordRulesOk = (password) => passwordRules.every((r) => r.regex.test(password || ''));

  const handleSignUpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      signUp: { ...f.signUp, [name]: type === 'checkbox' ? checked : value },
    }));
    if (name === 'password') {
      setShowSignUpChecklist(true);
      setSignUpMsg((m) => (m.msg ? { ...m, msg: '' } : m));
    }
    if (name === 'email') {
      setSignUpMsg((m) => (m.msg ? { ...m, msg: '' } : m));
    }
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, signIn: { ...f.signIn, [name]: value } }));
    if (name === 'password') {
      setSignInMsg((m) => (m.msg ? { ...m, msg: '' } : m));
    }
    if (name === 'email') {
      setSignInMsg((m) => (m.msg ? { ...m, msg: '' } : m));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { name, email, password, terms } = form.signUp;
  
    if (!name.trim() || !email.trim() || !password.trim()) {
      setSignUpMsg({ msg: "All fields are required.", error: true });
      return;
    }
    if (!isValidEmail(email)) {
      setSignUpMsg({ msg: "Please enter a valid email address.", error: true });
      return;
    }
    if (!areAllPasswordRulesOk(password)) {
      setSignUpMsg({ msg: "Please satisfy all password requirements.", error: true });
      setShowSignUpChecklist(true);
      return;
    }
    if (!terms) {
      setSignUpMsg({ msg: "Please accept the terms and conditions", error: true });
      return;
    }
  
    try {
      const res = await signUpUser({
        fullName: name,
        email,
        password,
        termsAccepted: terms,
      });
      setSignUpMsg({ msg: res.message || "Registration successful!", error: false });
  
      setForm((f) => ({ ...f, signUp: initialForm.signUp }));
      setTimeout(() => {
        setActive(false);
        setForm((f) => ({ ...f, signIn: { ...f.signIn, email } }));
        signInEmailRef.current?.focus();
      }, 2500);
    } catch (err) {
      setSignUpMsg({
        msg: err?.message || "Error registering. Try again.",
        error: true,
      });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const { email, password } = form.signIn;
  
    if (!email.trim() || !password.trim()) {
      setSignInMsg({ msg: "Email and password are required.", error: true });
      return;
    }
    if (!isValidEmail(email)) {
      setSignInMsg({ msg: "Please enter a valid email address.", error: true });
      return;
    }
  
    try {
      const res = await signInUser({ email, password });

      const userInfo = {
        fullName: res.user?.fullName || email,
        email: res.user?.email || email,
        token: res.token
      };
      localStorage.setItem("currentUser", JSON.stringify(userInfo));

      if (onLoginSuccess) {
        onLoginSuccess({
          ...userInfo,
          favorites: res.favorites || [],
          cart: res.cart || []
        });
      }

      setSignInMsg({ msg: "Login successful! Welcome back.", error: false });
    } catch (err) {
      setSignInMsg({
        msg: err?.message || "Invalid email or password. Please try again.",
        error: true,
      });
    }
  };

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
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input
                type={showSignUpPwd ? 'text' : 'password'}
                name="password"
                placeholder="(eg. Password@123)"
                value={form.signUp.password}
                onChange={handleSignUpChange}
                onFocus={() => { setSignUpPwdFocused(true); setShowSignUpChecklist(true); }}
                onBlur={() => { setSignUpPwdFocused(false); setTimeout(() => setShowSignUpChecklist(false), 150); }}
                required
                ref={signUpPwdRef}
              />
              <span className="toggle-password" onClick={() => setShowSignUpPwd((v) => !v)}><i className={`fa-regular ${showSignUpPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i></span>
              {(showSignUpChecklist && (signUpPwdFocused || (form.signUp.password || '').length > 0) && !areAllPasswordRulesOk(form.signUp.password)) && (
                <div className="pwd-checklist" role="dialog" aria-live="polite">
                  <div className="pwd-checklist-title">Password must contain:</div>
                  <ul className="pwd-checklist-list">
                    {getUnmetPasswordRules(form.signUp.password).map((r) => (
                      <li key={r.id} className="pwd-checklist-item">
                        <span className="pwd-checklist-label">{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input
                type={showSignInPwd ? 'text' : 'password'}
                name="password"
                placeholder="(eg. Password@123)"
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