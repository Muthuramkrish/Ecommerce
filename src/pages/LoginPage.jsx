import React, { useState, useRef, useEffect } from 'react';

const initialForm = {
  signUp: { name: '', email: '', password: '', terms: false },
  signIn: { email: '', password: '' },
};

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
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
      return users.find((user) => user.email === lastUserEmail) || null;
    }
    return null;
  } catch {
    return null;
  }
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

const LoginPage = ({ onLoginSuccess, onClose }) => {
  const [active, setActive] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [signUpMsg, setSignUpMsg] = useState({ msg: '', error: false });
  const [signInMsg, setSignInMsg] = useState({ msg: '', error: false });
  const [showSignUpPwd, setShowSignUpPwd] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);

  useEffect(() => {
    const lastUser = getLastUser();
    if (lastUser) {
      setForm((f) => ({ ...f, signIn: { ...f.signIn, email: lastUser.email } }));
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

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

    if (!isValidEmail(email)) {
      setSignUpMsg({ msg: 'Please enter a valid email address.', error: true });
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

    if (!isValidEmail(email)) {
      setSignInMsg({ msg: 'Please enter a valid email address.', error: true });
      return;
    }
    
    const user = authenticateUser(email, password);
    if (user) {
      setSignInMsg({ msg: 'Login successful! Welcome back.', error: false });
      setTimeout(() => {
        onLoginSuccess(user);
      }, 1000);
    } else {
      setSignInMsg({ msg: 'Invalid email or password. Please try again.', error: true });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '15px',
        minWidth: '450px',
        position: 'relative',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <a 
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none'
          }}
        >
          ×
        </a>

        {/* Toggle Buttons */}
        <div style={{ display: 'flex', marginBottom: '30px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActive(false)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: active ? 'transparent' : '#1e3a8a',
              color: active ? '#374151' : 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderBottom: active ? 'none' : '3px solid #1e3a8a'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActive(true)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              background: active ? '#1e3a8a' : 'transparent',
              color: active ? 'white' : '#374151',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderBottom: active ? '3px solid #1e3a8a' : 'none'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In Form */}
        {!active && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1f2937', fontSize: '24px' }}>
              Welcome Back
            </h2>
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.signIn.email}
                  onChange={handleSignInChange}
                  name="email"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignInPwd ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.signIn.password}
                    onChange={handleSignInChange}
                    name="password"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '50px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPwd(!showSignInPwd)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    {showSignInPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: '#1e3a8a',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e40af'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1e3a8a'}
              >
                Sign In
              </button>
            </form>

            {signInMsg.msg && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: signInMsg.error ? '#fef2f2' : '#f0fdf4',
                color: signInMsg.error ? '#dc2626' : '#16a34a',
                textAlign: 'center',
                border: `1px solid ${signInMsg.error ? '#fecaca' : '#bbf7d0'}`
              }}>
                {signInMsg.msg}
              </div>
            )}
          </div>
        )}

        {/* Sign Up Form */}
        {active && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1f2937', fontSize: '24px' }}>
              Create Account
            </h2>
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.signUp.name}
                  onChange={handleSignUpChange}
                  name="name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.signUp.email}
                  onChange={handleSignUpChange}
                  name="email"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignUpPwd ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.signUp.password}
                    onChange={handleSignUpChange}
                    name="password"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      paddingRight: '50px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1e3a8a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPwd(!showSignUpPwd)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    {showSignUpPwd ? '🙈' : '👁️'}
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={form.signUp.terms}
                  onChange={handleSignUpChange}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="terms" style={{ fontSize: '14px', color: '#374151' }}>
                  I accept the terms and conditions
                </label>
              </div>

              <button
                type="submit"
                style={{
                  background: '#1e3a8a',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e40af'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1e3a8a'}
              >
                Create Account
              </button>
            </form>

            {signUpMsg.msg && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: signUpMsg.error ? '#fef2f2' : '#f0fdf4',
                color: signUpMsg.error ? '#dc2626' : '#16a34a',
                textAlign: 'center',
                border: `1px solid ${signUpMsg.error ? '#fecaca' : '#bbf7d0'}`
              }}>
                {signUpMsg.msg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;