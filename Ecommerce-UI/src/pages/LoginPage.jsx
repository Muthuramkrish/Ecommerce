import React, { useState, useRef } from "react";
import { Eye, EyeOff, Facebook, Instagram, Mail, Github, ArrowLeft } from "lucide-react";
import { signUpUser, signInUser } from "../api/user";
import sideImage from "../assets/login.png";

const initialForm = {
  signUp: { name: "", email: "", password: "", terms: false },
  signIn: { email: "", password: "" },
};

const LoginPage = ({ onLoginSuccess }) => {
  const [active, setActive] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [signUpMsg, setSignUpMsg] = useState({ msg: "", error: false });
  const [signInMsg, setSignInMsg] = useState({ msg: "", error: false });
  const [showSignUpPwd, setShowSignUpPwd] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const signInEmailRef = useRef(null);
  const signInPwdRef = useRef(null);
  const signUpPwdRef = useRef(null);
  const [showSignUpChecklist, setShowSignUpChecklist] = useState(false);
  const [signUpPwdFocused, setSignUpPwdFocused] = useState(false);

  const isValidEmail = (email) => {
    const value = String(email || "").trim();
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return emailRegex.test(value);
  };

  const passwordRules = [
    { id: "len", regex: /.{8,}/, label: "At least 8 characters" },
    { id: "upper", regex: /[A-Z]/, label: "At least one uppercase letter" },
    { id: "lower", regex: /[a-z]/, label: "At least one lowercase letter" },
    { id: "num", regex: /[0-9]/, label: "At least one number" },
    { id: "special", regex: /[^A-Za-z0-9]/, label: "At least one special character" },
  ];

  const getUnmetPasswordRules = (password) =>
    passwordRules
      .filter((r) => !r.regex.test(password || ""))
      .map((r) => ({ id: r.id, label: r.label }));

  const areAllPasswordRulesOk = (password) =>
    passwordRules.every((r) => r.regex.test(password || ""));

  const handleSignUpChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      signUp: { ...f.signUp, [name]: type === "checkbox" ? checked : value },
    }));
    if (name === "password") {
      setShowSignUpChecklist(true);
      setSignUpMsg((m) => (m.msg ? { ...m, msg: "" } : m));
    }
    if (name === "email") {
      setSignUpMsg((m) => (m.msg ? { ...m, msg: "" } : m));
    }
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, signIn: { ...f.signIn, [name]: value } }));
    if (name === "password" || name === "email") {
      setSignInMsg((m) => (m.msg ? { ...m, msg: "" } : m));
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

      if (res.token) {
        setAuthToken(res.token);
      }

      const userInfo = {
        fullName: res.user?.fullName || email,
        email: res.user?.email || email,
        token: res.token
      };
      // Note: localStorage is already set in signInUser API function

      setCurrentUser(userInfo);
      setSignInMsg({ msg: "Login successful! Welcome back.", error: false });

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            ...userInfo,
            favorites: res.favorites || [],
            cart: res.cart || []
          });
        }
      }, 2000);

    } catch (err) {
      setSignInMsg({
        msg: err?.message || "Invalid email or password. Please try again.",
        error: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-2 sm:p-4 lg:p-6 overflow-hidden">
      <div className="hidden md:flex items-center justify-center rounded-3xl p-4">
        <img
          src={sideImage}
          alt="WELCOME TO VIKOSHIYA"
          className="w-[85%] max-w-[380px] h-auto object-contain rounded-[2rem] shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>

      <div className="relative w-full max-w-[900px] h-full max-h-[600px] sm:max-h-[650px] lg:max-h-[600px] bg-white rounded-5xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="absolute top-10 left-10 sm:top-10 sm:left-10 z-40 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-all shadow-md hover:shadow-lg"
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>

        {/* Mobile Background Panels */}
        <div className="md:hidden absolute inset-0">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 transition-transform duration-700 ease-in-out ${active ? "translate-x-0" : "translate-x-full"
              }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 transition-transform duration-700 ease-in-out ${active ? "-translate-x-full" : "translate-x-0"
              }`}
          />
        </div>

        {/* Sign In Form */}
        <div
          className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-700 ease-in-out z-10 ${active
            ? "opacity-0 pointer-events-none -translate-x-full md:translate-x-full"
            : "translate-x-0 opacity-100 pointer-events-auto"
            }`}
        >
          <div className="w-full max-w-sm overflow-y-auto max-h-full py-4 custom-scrollbar">
            <form autoComplete="off" noValidate onSubmit={handleSignIn} className="w-full">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-3 sm:mb-4 lg:mb-6">Sign In</h2>
              <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  <Facebook size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-pink-500 hover:text-pink-500 transition-colors">
                  <Instagram size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-red-500 hover:text-red-500 transition-colors">
                  <Mail size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-slate-700 hover:text-slate-700 transition-colors">
                  <Github size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-4 lg:mb-6">or use email password</p>

              <div className="space-y-2.5 sm:space-y-3 lg:space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.signIn.email}
                  onChange={handleSignInChange}
                  required
                  autoComplete="username"
                  ref={signInEmailRef}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 lg:py-3 text-sm lg:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <div className="relative">
                  <input
                    type={showSignInPwd ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={form.signIn.password}
                    onChange={handleSignInChange}
                    required
                    autoComplete="current-password"
                    ref={signInPwdRef}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 lg:py-3 pr-10 sm:pr-12 text-sm lg:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPwd((v) => !v)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showSignInPwd ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>

                <a href="#" className="block text-xs sm:text-sm text-blue-600 hover:text-blue-700 text-right transition-colors">
                  Forgot password?
                </a>

                {signInMsg.msg && (
                  <div
                    className={`p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm text-center ${signInMsg.error
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    aria-live="polite"
                  >
                    {signInMsg.msg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 lg:py-3 text-sm lg:text-base rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sign Up Form */}
        <div className={`absolute top-0 right-0 w-full md:w-1/2 h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-700 ease-in-out z-10 ${active ? 'translate-x-0 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-x-full md:-translate-x-full'
          }`}>
          <div className="w-full max-w-sm overflow-y-auto max-h-full py-4 custom-scrollbar">
            <form autoComplete="off" noValidate onSubmit={handleSignUp} className="w-full">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 text-center mb-3 sm:mb-4 lg:mb-6">Create Account</h2>
              <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-blue-500 hover:text-blue-500 transition-colors">
                  <Facebook size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-pink-500 hover:text-pink-500 transition-colors">
                  <Instagram size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-red-500 hover:text-red-500 transition-colors">
                  <Mail size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
                <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border-2 border-slate-300 hover:border-slate-700 hover:text-slate-700 transition-colors">
                  <Github size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-4 lg:mb-6">or use email for registration</p>

              <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.signUp.name}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 lg:py-3 text-sm lg:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.signUp.email}
                  onChange={handleSignUpChange}
                  required
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 lg:py-3 text-sm lg:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <div className="relative">
                  <input
                    type={showSignUpPwd ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={form.signUp.password}
                    onChange={handleSignUpChange}
                    onFocus={() => { setSignUpPwdFocused(true); setShowSignUpChecklist(true); }}
                    onBlur={() => { setSignUpPwdFocused(false); setTimeout(() => setShowSignUpChecklist(false), 150); }}
                    required
                    ref={signUpPwdRef}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 lg:py-3 pr-10 sm:pr-12 text-sm lg:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPwd((v) => !v)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showSignUpPwd ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </button>
                  {(showSignUpChecklist && (signUpPwdFocused || (form.signUp.password || '').length > 0) && !areAllPasswordRulesOk(form.signUp.password)) && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-3 sm:p-4 z-20" role="dialog" aria-live="polite">
                      <div className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Password must contain:</div>
                      <ul className="space-y-1">
                        {getUnmetPasswordRules(form.signUp.password).map((r) => (
                          <li key={r.id} className="text-[10px] sm:text-xs text-slate-600 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{r.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="signup-terms"
                    name="terms"
                    checked={form.signUp.terms}
                    onChange={handleSignUpChange}
                    required
                    className="mt-0.5 sm:mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="signup-terms" className="text-xs sm:text-sm text-slate-600 cursor-pointer">
                    I accept the terms and conditions
                  </label>
                </div>

                {signUpMsg.msg && (
                  <div
                    className={`p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm text-center ${signUpMsg.error
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                      }`}
                    aria-live="polite"
                  >
                    {signUpMsg.msg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 lg:py-3 text-sm lg:text-base rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Toggle Overlay Panel */}
        <div className={`hidden md:block absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out z-20 ${active ? 'left-0' : 'left-1/2'
          }`}>
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden rounded-5xl">
            {/* Left Panel - Hello Again */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-white p-8 lg:p-12 transition-all duration-700 ${active ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 text-center">Hello Again!</h1>
              <p className="text-center text-blue-100 mb-6 lg:mb-8 max-w-xs leading-relaxed text-sm lg:text-base px-4">
                Please log in to pick up where you left off.
              </p>
              <button
                type="button"
                onClick={() => setActive(false)}
                className="px-8 lg:px-12 py-2.5 lg:py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 text-sm lg:text-base"
              >
                Sign In
              </button>
            </div>

            {/* Right Panel - Hi There */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-white p-8 lg:p-12 transition-all duration-700 ${active ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 lg:mb-4 text-center">Hi There! New Here?</h1>
              <p className="text-center text-blue-100 mb-6 lg:mb-8 max-w-xs leading-relaxed text-sm lg:text-base px-4">
                Create an account to get started.
              </p>
              <button
                type="button"
                onClick={() => setActive(true)}
                className="px-8 lg:px-12 py-2.5 lg:py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 text-sm lg:text-base"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="md:hidden absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center gap-3 sm:gap-4 px-4 z-30">
          <button
            type="button"
            onClick={() => setActive(false)}
            className={`px-5 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all ${!active
              ? 'bg-blue-600 text-white'
              : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActive(true)}
            className={`px-5 sm:px-6 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all ${active
              ? 'bg-blue-600 text-white'
              : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
              }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style >{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;