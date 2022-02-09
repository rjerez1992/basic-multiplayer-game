import './App.css';
import Board from './components/Board/Board';

function App() {
  //Reference: https://www.kindacode.com/article/react-typescript-handling-keyboard-events/
  const keyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(event.code);
    if (event.code === "ArrowUp") {
      console.log("Arrow up pressed");
    }

    if (event.code === "ArrowDown") {
      console.log("Arrow down pressed");
    }

    if (event.code === "ArrowLeft") {
      console.log("Arrow left pressed");
    }

    if (event.code === "ArrowRight") {
      console.log("Arrow right pressed");
    }
  };

  return (
    <div id="app" contentEditable={true} onKeyDown={keyDownHandler}>
      <Board/>
    </div>
  );
}

export default App;
