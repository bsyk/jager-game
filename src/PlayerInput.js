import React from 'react';
import PropTypes from 'prop-types';
import { DeleteOutline } from '@material-ui/icons'

const PlayerInput = ({ idx, player, onPlayerChange, onRemovePlayer }) => {
  const playerId = `name-${idx}`;
  return (
    <div key={`Player-${idx}`} className={'inputrow'}>
      <label htmlFor={playerId}>{`Player #${idx + 1}`}</label>
      <input
        type="text"
        name={playerId}
        data-idx={idx}
        id={playerId}
        className="name"
        value={player.name}
        onChange={onPlayerChange}
      />
      <button type="button" className={'delete'} data-idx={idx} onClick={onRemovePlayer} ><DeleteOutline/></button>
    </div>
  );
};

PlayerInput.propTypes = {
  idx: PropTypes.number,
  player: PropTypes.object,
  onPlayerChange: PropTypes.func,
  onRemoveChange: PropTypes.func,
};

export default PlayerInput;