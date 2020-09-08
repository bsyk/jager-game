import React, { useState } from 'react';
import { ShuffleOutlined, PeopleOutlined, PersonAddOutlined, DoneOutline, HighlightOffOutlined } from '@material-ui/icons';
import './App.css';
import PlayerInput from './PlayerInput';
import TimelineRow from './TimelineRow';

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
  const lastAllocations = getLSOrDefault('allocations', []);
  const hasAllocations = !!lastAllocations.length;
  const [allocationState, setAllocationState] = useState(lastAllocations);
  const [playerShowState, setPlayerShowState] = useState(!hasAllocations);
  const [isDrawn, setDrawn] = useState(hasAllocations);

  const onUpdatePlayerList = playerList => {
    setLS('playerList', playerList);
    setPlayerState(playerList);
  };

  const onAddPlayer = () => {
    onUpdatePlayerList([...playerState, { ...blankPlayer }]);
  };

  const onRemovePlayer = (e) => {
    onUpdatePlayerList(playerState.filter((_x, i) => i !== parseInt(e.currentTarget.dataset.idx)));
  };

  const onPlayerChange = (e) => {
    const updatedPlayers = [...playerState];
    updatedPlayers[e.target.dataset.idx][e.target.className] = e.target.value;
    onUpdatePlayerList(updatedPlayers);
  };

  const onCloseEditPlayers = () => {
    setPlayerShowState(false);
  };

  const onEditPlayers = () => {
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
    const gameLength = 5400;
    const halfTime = gameLength / 2;
    const halfTimeEntry = { start: halfTime, end: halfTime, label: 'Half Time', type: 'marker' };
    const windowSecs = Math.round(gameLength / slotCount);
    // Make the windows
    const windows = allocationOrder.reduce((windows, _, i) => {
      return [...windows, { start: i * windowSecs, end: (i + 1) * windowSecs, type: 'allocation' }];
    }, []);
    // Make sure the last window goes to the end
    windows[playerCount - 1].end = gameLength;
    // Allocate a player to each window
    let allocations = windows.map((w, i) => ({ ...w, label: playerState[allocationOrder[i]].name }));
    // Split an allocation that crosses half-time
    const halfTimeAllocation = allocations.findIndex(a => a.start < halfTime && a.end> halfTime);
    if (~halfTimeAllocation) {
      const before = allocations.slice(0, halfTimeAllocation);
      const after = allocations.slice(halfTimeAllocation + 1);
      const splitBefore = { ...allocations[halfTimeAllocation], end: halfTime, type: 'allocation split' };
      const splitAfter = { ...allocations[halfTimeAllocation], start: halfTime, type: 'allocation split' };
      allocations = [...before, splitBefore, halfTimeEntry, splitAfter, ...after];
    } else {
      // Insert the halfTime entry
      allocations = [...allocations.slice(0, allocations.length / 2), halfTimeEntry, ...allocations.slice(allocations.length / 2)];
    }
    setLS('allocations', allocations);
    setAllocationState(allocations);
  };

  const shuffleInPlace = array => {
    for (let i = array.length - 1; i> 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const onReset = () => {
    setDrawn(false);
  };
  
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
            <div className={'buttonrow'}>
              <button type="button" onClick={onAddPlayer}><PersonAddOutlined /></button>
              <button type="button" onClick={onCloseEditPlayers}><DoneOutline /></button>
            </div>
          </div>
        ) : (
          /**
           * Game mode
           */
          <div>
            {
              !isDrawn &&
              <>
                <p>
                  Ready to play?
                </p>
                <div>
                  { playerState.map(player => player.name).join(', ') }
                </div>
                <div className={'buttonrow'}>
                  <button type="button" onClick={onEditPlayers}><PeopleOutlined /></button>
                  <button type="button" onClick={onDraw}><ShuffleOutlined /></button>
                </div>
              </>
            }
            { isDrawn &&
              <>
                <div className={'timeline'}><ul>
                  { allocationState.map(({ label, start, end, type }, idx) => 
                      <TimelineRow label={label} start={start} end={end} type={type} idx={idx} />
                    )
                  }
                </ul></div>
                <div className={'buttonrow'}>
                  <button type="button" onClick={onReset}><HighlightOffOutlined /></button>
                </div>
              </>
            }
          </div>
        )
      }
    </div>
  );
}

export default App;
