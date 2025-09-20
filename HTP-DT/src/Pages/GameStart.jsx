import { Link } from 'react-router-dom';

function GameStart() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome to the Game!</h2>
        <Link to="/gameselection">      
            <button>Start the Game</button>
        </Link>
        <Link to="/">
            <button>Back to Home</button>
        </Link>
    </div>
  );
}

export default GameStart;