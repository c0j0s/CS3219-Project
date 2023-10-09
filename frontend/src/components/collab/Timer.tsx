"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@nextui-org/react";
import { useCollabContext } from "@/contexts/collab";

interface TimerProps {
  setSessionEnded: () => void;
  timeDifference: number;
};

const Timer: React.FC<TimerProps> = ({ setSessionEnded, timeDifference }) => {

  const { socketService } = useCollabContext();

  if (!socketService) return null;

  const [showTimer, setShowTimer] = useState<boolean>(true);
  // For some reason the state cannot be set to timeDifference on render
  const [time, setTime] = useState<number>(0); 
  
  const formatTime = (): string => {
    if (time <= 0) {
      return "00:00:00";
    }

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  // This will set time to timeDifference after render
  useEffect(() => {
    setTime(timeDifference)
  }, [timeDifference])

  useEffect(() => {
    // Timer will go to -1 before it initializes after render
    // If time can be set to timeDifference on render, this can be changed to <= 0
    if (time < -1) { 
      setSessionEnded();
    }
  }, [time])

  // create timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {

        const newTime = prevTime - 1
        localStorage.setItem("time", newTime.toString());

        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {showTimer ? (
        <div className="flex items-center space-x-2 p-1.5 cursor-pointer rounded">
          <div onClick={() => setShowTimer(false)}>{formatTime()}</div>
        </div>
      ) : (
        <div
          className="flex items-center text-white cursor-pointer rounded"
          onClick={() => {
            setShowTimer(true)
          }}
        >
          <Image src="/timer.svg" className="" />
        </div>
      )}
    </div>
  );
};
export default Timer;
