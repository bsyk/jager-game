import React, { useState } from 'react';
import './App.css';
import PlayerInput from './PlayerInput';

const getLSOrDefault = (key, def) => {
  const lsValue = localStorage.getItem(key);
  if (lsValue) {
    try {
      return JSON.parse(lsValue);
    } catch (e) {
      console.error(`Can't parse value from localstorage, using default`, e);
    }
  }
  return def;
};

const setLS = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

function App() {

  const blankPlayer = { name: ''};
  const lastPlayers = getLSOrDefault('playerList', [{ ...blankPlayer },{ ...blankPlayer },{ ...blankPlayer }]);
  const [playerState, setPlayerState] = useState(lastPlayers);
  const lastAllocations = localStorage.getItem('allocations');
  const [allocationState, setAllocationState] = useState(lastAllocations ? JSON.parse(lastAllocations) : []);
  const [playerShowState, setPlayerShowState] = useState(true);
  const [isDrawn, setDrawn] = useState(false);

  const onUpdatePlayerList = playerList => {
    setLS('playerList', playerList);
    setPlayerState(playerList);
  };

  const onAddPlayer = () => {
    onUpdatePlayerList([...playerState, { ...blankPlayer }]);
  };

  const onRemovePlayer = (e) => {
    onUpdatePlayerList(playerState.filter((_x, i) => i !== parseInt(e.target.dataset.idx)));
  };

  const onPlayerChange = (e) => {
    const updatedPlayers = [...playerState];
    updatedPlayers[e.target.dataset.idx][e.target.className] = e.target.value;
    onUpdatePlayerList(updatedPlayers);
  };

  const onHidePlayers = () => {
    setPlayerShowState(false);
  };

  const onShowPlayers = () => {
    setPlayerShowState(true);
  };

  const onDraw = () => {
    setDrawn(true);
    // Shuffle and allocate slots
    // Create array of indexes that we can shuffle
    const playerCount = playerState.length;
    const slotsPerPlayer = 1;
    const slotCount = playerCount * slotsPerPlayer;
    const allocationOrder = shuffleInPlace([...Array(slotCount)].map((_, i) => i < playerCount ? i : i - playerCount));
    // What size is each window
    const gameLength = 90;
    const halfTime = gameLength / 2;
    const halfTimeEntry = { start: halfTime, end: halfTime, label: 'Half Time', type: 'marker' };
    const windowMins = Math.round(gameLength / slotCount);
    // Make the windows
    const windows = allocationOrder.reduce((windows, _, i) => {
      return [...windows, { start: i * windowMins, end: (i + 1) * windowMins, type: 'allocation' }];
    }, []);
    // Make sure the last window goes to the end
    windows[playerCount - 1].end = gameLength;
    // Allocate a player to each window
    let allocations = windows.map((w, i) => Object.assign({}, w, { label: playerState[allocationOrder[i]].name }));
    // Split an allocation that crosses half-time
    const halfTimeAllocation = allocations.findIndex(a => a.start < halfTime && a.end > halfTime);
    if (~halfTimeAllocation) {
      const before = allocations.slice(0, halfTimeAllocation);
      const after = allocations.slice(halfTimeAllocation + 1);
      const splitBefore = Object.assign({}, allocations[halfTimeAllocation], { end: halfTime, type: 'allocation split' });
      const splitAfter = Object.assign({}, allocations[halfTimeAllocation], { start: halfTime, type: 'allocation split' });
      allocations = [...before, splitBefore, halfTimeEntry, splitAfter, ...after];
    } else {
      // Insert the halfTime entry
      allocations = [...allocations.slice(0, allocations.length / 2), halfTimeEntry, ...allocations.slice(allocations.length)];
    }
    setAllocationState(allocations);
  };

  const shuffleInPlace = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const onReset = () => {
    // TODO: Also reset allocated slots? Needed?
    setDrawn(false);
  };

  const asTime = x => `${(''+Math.floor(x/60)).padStart(2, '0')}:${(''+(x%60)).padStart(2, '0')}`;

  return (
    <div className="App">
      <header className="App-header">
        <img src={process.env.PUBLIC_URL + '/dinner.png'} className="App-logo" alt="dinner" />
      </header>
      {
        playerShowState ? (
          /**
           * Edit players mode
           */
          <div>
            <p>
              Who's playing?
            </p>
            {
              playerState.map((player, idx) => 
                <PlayerInput
                  key={`player-${idx}`}
                  idx={idx}
                  player={player}
                  onPlayerChange={onPlayerChange}
                  onRemovePlayer={onRemovePlayer}
                />)
            }
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
                <div className={'timeline'}><ul>
                  { allocationState.map(({ label, start, end, type }, idx) => 
                      <li key={`player-${idx}`}>
                        <div className={'line'}></div>
                        <div className={'title'}>
                          { `${label}` }
                        </div>
                        <div className={'number'}>
                          <span>{ `${asTime(start)}` }</span>
                          <span>{ `${asTime(end)}` }</span>
                        </div>
                      </li>
                    )
                  }
                </ul></div>
                <input type="button" value="Reset" onClick={onReset} />
              </>
            }
          </div>
        )
      }
    </div>
  );
}

export default App;
