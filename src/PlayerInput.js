import React from 'react';
import PropTypes from 'prop-types';

const PlayerInput = ({ idx, player, onPlayerChange, onRemovePlayer }) => {
  const playerId = `name-${idx}`;
  return (
    <div key={`Player-${idx}`}>
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
      <input type="button" data-idx={idx} value="Remove" onClick={onRemovePlayer} />
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