import React, { useState, useEffect, useRef } from 'react';
import "./App.css";

import { fromEvent, interval } from 'rxjs';
import { debounceTime, filter, buffer } from 'rxjs/operators';

const App = () => {
  const [time, setTime] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  const refTime = useRef(time);
  const refTimerOn = useRef(timerOn);

  const btn_start = useRef(null);
  const btn_wait = useRef(null);
  const btn_reset = useRef(null);

  useEffect(() => {
    refTime.current = time;
  }, [time])

  useEffect(() => {
    const source = interval(1000);
    const subscribe = source.subscribe(val => {
      if (!timerOn) {
        subscribe.unsubscribe();
        return false;
      };
      setTime(prevTime => prevTime + 1);
    });

    refTimerOn.current = timerOn;

    return () => subscribe.unsubscribe();
  }, [timerOn]);

  useEffect(() => {
    const clickyStart = fromEvent(btn_start.current, 'click').subscribe(() => {
      startOfTimer();
    });

    const clickyWait = fromEvent(btn_wait.current, 'click');
    const dblClickyWait = clickyWait.pipe(
      buffer(clickyWait.pipe(debounceTime(300))),
      filter(clickArr => clickArr.length > 1)
    )
      .subscribe((val => val.length > 1 && waitOfTimer()));

    const clickyReset = fromEvent(btn_reset.current, 'click').subscribe(() => {
      resetOfTimer();
    });

    return () => {
      clickyStart.unsubscribe();
      dblClickyWait.unsubscribe();
      clickyReset.unsubscribe();
    }
  }, [])

  const startOfTimer = () => {
    if (refTimerOn.current) {
      setTimerOn(false);
      setTime(0);
    } else {
      setTimerOn(true);
    }
  }

  const resetOfTimer = () => {
    if (refTime.current > 0) {
      setTime(0);
      setTimerOn(true);
    }
  }

  const waitOfTimer = () => setTimerOn(false);

  return (
    <div className="App">
      <div className="time">
        <span>{("0" + (Math.floor(time / 3600) % 60)).slice(-2)}:</span>
        <span>{("0" + (Math.floor(time / 60) % 60)).slice(-2)}:</span>
        <span>{("0" + (time % 60)).slice(-2)}</span>
      </div>
      <div className="control">
        <button ref={btn_start} className={"btn btn--" + (timerOn ? "danger" : "success")}>{timerOn ? "Stop" : "Start"}</button>
        <button ref={btn_wait} className="btn btn--primary">Wait</button>
        <button ref={btn_reset} className="btn btn--danger">Reset</button>
      </div>
    </div >
  );
};

export default App;
