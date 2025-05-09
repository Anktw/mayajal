'use client'

import React, { useState, useEffect } from 'react';
import { formatTimeFromSeconds } from '../utils/timeUtils';

interface TimerProps {
  endTime: Date;
}

export function Timer({ endTime }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();
      setTimeLeft(Math.max(0, Math.floor(difference / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="text-lg font-semibold">
      Time left: {formatTimeFromSeconds(timeLeft)}
    </div>
  );
}

