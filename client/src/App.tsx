import Board from './components/Board/Board';
import Home from './components/Home/Home';
import { Route, Routes } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />
      </Routes>
    </div>
  );
}

export default App;
