import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // We use localhost:5001 because the browser is outside the Docker network
    axios.get('http://localhost:5001/')
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage("Error connecting to API"));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>ML Studio</h1>
      <p>Backend Status: <strong>{message}</strong></p>
    </div>
  );
}

export default App;