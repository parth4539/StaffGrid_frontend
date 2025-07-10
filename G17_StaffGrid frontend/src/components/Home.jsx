import React, { useState } from 'react'; 
import NavBar from './NavBar'
import Sidebar from './Sidebar';
import "../components/css/home.css"

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        <NavBar toggleMenu={toggleMenu} />
        <Sidebar menuOpen={menuOpen} toggleMenu={toggleMenu} />
      </header>
    </div>
  );
}

export default Home;
