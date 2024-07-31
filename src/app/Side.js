import './Side.scss';

function Side() {
  return (
    <div className="App-Side">
      <h1>Android Assets Generator</h1>

      <h3>Choose a PNG file (1024 x 1024) :</h3>

      <div className="App-Side-Input">
        <input type="file" accept="*.png" />
      </div>
    </div>
  )
}

export default Side;
