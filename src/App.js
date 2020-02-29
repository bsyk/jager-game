import React, { useState } from 'react';
import './App.css';
import PlayerInput from './PlayerInput';

function App() {

  const blankPlayer = { name: ''};
  const [playerState, setPlayerState] = useState([{ ...blankPlayer }]);
  const [playerShowState, setPlayerShowState] = useState(true);
  const [isDrawn, setDrawn] = useState(false);

  const onAddPlayer = () => {
    setPlayerState([...playerState, { ...blankPlayer }]);
  };

  const onRemovePlayer = (e) => {
    setPlayerState(playerState.filter((_x, i) => i !== parseInt(e.target.dataset.idx)));
  };

  const onPlayerChange = (e) => {
    const updatedPlayers = [...playerState];
    updatedPlayers[e.target.dataset.idx][e.target.className] = e.target.value;
    setPlayerState(updatedPlayers);
  };

  const onHidePlayers = () => {
    setPlayerShowState(false);
  };

  const onShowPlayers = () => {
    setPlayerShowState(true);
  };

  const onDraw = () => {
    setDrawn(true);
    // TODO: Shuffle and allocate slots
    // Create array of indexes that we can shuffle
    const playerCount = playerState.length;
    const allocationOrder = shuffleInPlace([...Array(playerCount)].map((_, i) => i));
    // What size is each window
    const gameLength = 90;
    const windowMins = Math.round(gameLength / playerCount);
    // Make the windows
    const windows = allocationOrder.reduce((windows, _, i) => {
      return [...windows, { start: i * windowMins, end: (i + 1) * windowMins }];
    }, []);
    // Make sure the last window goes to the end
    windows[playerCount - 1].end = gameLength;
    // Allocate each player to a window
    setPlayerState(playerState.map((player, i) => Object.assign({}, player, windows[allocationOrder[i]])));
  }

  const shuffleInPlace = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const onReset = () => {
    // TODO: Also reset allocated slots? Needed?
    setDrawn(false);
  }

  const asTime = x => `${(''+Math.floor(x/60)).padStart(2, '0')}:${(''+(x%60)).padStart(2, '0')}`;

  return (
    <div className="App">
      <header className="App-header">
        <img src={process.env.PUBLIC_URL + '/dinner.png'} className="App-logo" alt="dinner" />
        <p>
          Who's playing?
        </p>
        {
          playerShowState ? (
            /**
             * Edit players mode
             */
            <div> {
              playerState.map((player, idx) => 
                <PlayerInput
                  key={`player-${idx}`}
                  idx={idx}
                  player={player}
                  onPlayerChange={onPlayerChange}
                  onRemovePlayer={onRemovePlayer}
                />
              )}
              <input type="button" value="Add Player" onClick={onAddPlayer} />
              <input type="button" value="Done" onClick={onHidePlayers} />
            </div>
          ) : (
            /**
             * Game mode
             */
            <div>
              {
                !isDrawn &&
                <>
                  <div>
                    { playerState.map(player => player.name).join(', ') }
                  </div>
                  <input type="button" value="Edit Players" onClick={onShowPlayers} />
                  <input type="button" value="Draw" onClick={onDraw} />
                </>
              }
              { isDrawn &&
                <>
                  { [...playerState].sort((a, b) => a.start - b.start).map((player, idx) => 
                      <div key={`player-${idx}`}>
                        { `${asTime(player.start)} -> ${asTime(player.end)} - ${player.name}` }
                      </div>
                    )
                  }
                  <input type="button" value="Reset" onClick={onReset} />
                </>
              }
            </div>
          )
        }
      </header>
    </div>
  );
}

export default App;
