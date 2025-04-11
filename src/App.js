import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="text-center">
      <header className="bg-[#282c34] min-h-screen flex flex-col items-center justify-center text-white">
        <img src={logo} className="App-logo h-40 pointer-events-none" alt="logo" />
        <p className="text-xl">
          Edit <code className="font-mono">src/App.js</code> and save to reload.
        </p>
        <a
          className="text-[#61dafb] mt-4"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
