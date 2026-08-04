import { useEffect, useState } from "react";
import { MINUTE_MS } from "../meetings/meetingTime";

export default function useMinuteClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return now;
}
