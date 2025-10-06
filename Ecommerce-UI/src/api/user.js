// ✅ SIGN UP (REGISTER)
export async function signUpUser(data = {}) {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error(`Signup failed: ${response.status}`);
    }
  
    const json = await response.json();
    console.log(json);
    return json;
  }
  
  // ✅ SIGN IN (LOGIN)
  export async function signInUser(data = {}) {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
  
    const json = await response.json();
    console.log(json);
    return json;
  }
  