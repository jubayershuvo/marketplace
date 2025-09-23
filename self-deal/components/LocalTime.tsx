import { useEffect, useState } from "react";

interface LocalTimeProps {
  country: string;
}

const countryTimezones: Record<string, string> = {
  Bangladesh: "Asia/Dhaka",
  Pakistan: "Asia/Karachi",
  Canada: "America/Toronto", // default to Toronto, you can refine per province
  USA: "America/New_York",
  India: "Asia/Kolkata",
  UK: "Europe/London",
  Australia: "Australia/Sydney",
  // add more as needed
};


export default function LocalTime({ country }: LocalTimeProps) {
  const [time, setTime] = useState("00:00 AM");

  useEffect(() => {
    const updateTime = () => {
      const timezone = countryTimezones[country] || "UTC";
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      }).format(now);
      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [country]);

  return <span>{time}</span>;
}
