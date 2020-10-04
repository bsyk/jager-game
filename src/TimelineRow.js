import React, { useState } from 'react';
import PropTypes from 'prop-types';

const asClock = x => {
  const h = Math.floor(x/(60*60));
  const m = Math.floor((x-(h*60*60))/60);
  const s = x - ((h*60*60) + (m*60));
  const pad = [h, m, s].map(v => (''+v).padStart(2, '0'));
  return pad.join(':');
}

const asMinutes = x => {
  const m = Math.floor(x/60);
  const s = x - (m*60);
  return `${m}m ${s}s`;
}

const TimelineRow = ({ idx, label, start, end, type, surprise, mode, onTimeClick }) => {

  const [reveal, setReveal] = useState(!surprise);
  let hideTimer = null;

  const onReveal = () => {
    if (surprise) {
      setReveal(true);
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      hideTimer = setTimeout(() => setReveal(false), 5000);
    }
  };

  const asTime = (seconds) => {
    return mode === 'minutes' ? asMinutes(seconds) : asClock(seconds);
  }

  if (type === 'marker') {
    return (
      <li key={`marker-${idx}`}>
        <div className={'markertitle'}>
          { `${label}` }
        </div>
        <div className={'markernumber'}>
          <span onClick={onTimeClick}>{ `${asTime(start)}` }</span>
        </div>
      </li>
    );
  }
  
  return (
    <li key={`player-${idx}`} className={`${surprise && reveal ? 'reveal' : ''}`}>
      <div className={'line'}></div>
      <div className={'title'} onClick={onReveal}>
        { `${reveal ? label : 'Tap to reveal'}` }
      </div>
      <div className={'number'}>
        <span onClick={onTimeClick}>{ `${asTime(start)}` }</span>
        <span onClick={onTimeClick}>{ `${asTime(end)}` }</span>
      </div>
    </li>
  );
};

TimelineRow.propTypes = {
  idx: PropTypes.number,
  label: PropTypes.string,
  start: PropTypes.number,
  end: PropTypes.number,
  type: PropTypes.string,
  surprise: PropTypes.bool,
  mode: PropTypes.string,
};

export default TimelineRow;