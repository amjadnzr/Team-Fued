import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Timer = ({ initialTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          clearInterval(interval);
          onTimeUp();  // Call the time up function
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeUp]);

  useEffect(() => {
    setPercentage((timeLeft / initialTime) * 100);  // Update percentage for the circle
  }, [timeLeft, initialTime]);

  return (
    <div style={{ width: 100, height: 100 }}>
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
          textColor: '#f88',
          trailColor: '#d6d6d6',
        })}
      />
    </div>
  );
};

export default Timer;
