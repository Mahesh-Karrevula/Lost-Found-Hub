import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo">Lost & Found Hub</div>
        <nav>
          <button className="btn-primary">Report Item</button>
          <button className="btn-secondary">Login</button>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Find What You Lost, <br/>Return What You Found</h1>
          <p>The smartest community-driven platform to reunite people with their belongings.</p>
          <div className="search-bar">
            <input type="text" placeholder="Search for items... e.g. 'Blue Wallet'" />
            <button className="btn-primary">Search</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
