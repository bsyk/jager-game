import React from 'react';
import PropTypes from 'prop-types';

const asTime = x => {
  const h = Math.floor(x/(60*60));
  const m = Math.floor((x-(h*60*60))/60);
  const s = x - ((h*60*60) + (m*60));
  const pad = [h, m, s].map(v => (''+v).padStart(2, '0'));
  return pad.join(':');
}

const TimelineRow = ({ idx, label, start, end, type }) => {
  return (
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
  );
};

TimelineRow.propTypes = {
  idx: PropTypes.number,
  label: PropTypes.string,
  start: PropTypes.string,
  end: PropTypes.string,
  type: PropTypes.string,
};

export default TimelineRow;