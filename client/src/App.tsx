import './App.css';
import { Routes, Route } from "react-router-dom";
import Board from './components/Board/Board';
import Home from './components/Home/Home';

function App() {
  return (
    <div id="app">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/board" element={<Board/>}/>
      </Routes>
    </div>
  );
}

export default App;
