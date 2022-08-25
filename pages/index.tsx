import { DateTime } from "luxon";
import useSWR, { useSWRConfig } from "swr";
import CountUp from "react-countup";

import { basicYaks, buttonYaks } from "../lib/yaks";
import { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

type Yak = {
  button: boolean;
  content: string;
  id: string;
  score: number;
};

export default function Page() {
  const [yaks, setYaks] = useState<Yak[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      addYak(yaks, setYaks, "basic");
    }, 5000);
    return () => clearInterval(interval);
  }, [yaks, setYaks]);

  const { data, error } = useSWR(
    "/api/button",
    async () => {
      const res = await fetch("/api/button");
      return await res.json();
    },
    {
      refreshInterval: 5000,
    }
  );

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) {
    return null;
  }

  return (
    <html data-theme="autumn">
      <main className="relative w-full">
        <Stats count={data.count} />
        <div className='hero min-h-screen' style={{backgroundImage: `url("https://blog.akademos.com/hubfs/University+of+South+Dakota.jpg")`}}>
        <div className="hero-overlay bg-opacity-80" />
        <div className='hero-content'>
        <TheButton yaks={yaks} setYaks={setYaks} />
        </div>
        </div>
        <YakFeed yaks={yaks} />
      </main>
    </html>
  );
}

const Stats = ({ count }: { count: number }) => (
  <div className="absolute mt-6 flex w-full justify-center">
    <div className="stats shadow-xl">
      <div className="stat">
        <div className="stat-title">Total Button Pushes</div>
        <div className="stat-value select-none text-center">
          <CountUp
            duration={2}
            preserveValue={true}
            end={count}
            useEasing={true}
          />
        </div>
      </div>
    </div>
  </div>
);

const TheButton = ({
  yaks,
  setYaks,
}: {
  yaks: Yak[];
  setYaks: (value: Yak[]) => void;
}) => {
  const { mutate } = useSWRConfig();

  return (
      <button
        className="btn btn-primary btn-lg shadow-xl"
        onClick={async () => {
          addYak(yaks, setYaks, "button");
          await fetch("/api/button", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ts: DateTime.now().toISO() }),
          });
          await mutate("/api/button");
        }}
      >
        Don{"'"}t push the button
      </button>
  );
};

const addYak = (
  yaks: Yak[],
  setYaks: (value: Yak[]) => void,
  yakType: "basic" | "button"
) => {
  const newYaks = [...yaks];

  yakType === "basic"
    ? newYaks.push({
        button: false,
        content: basicYaks[Math.floor(Math.random() * basicYaks.length)],
        id: uuidv4(),
        score: Math.floor(Math.random() * 20),
      })
    : newYaks.push({
        button: true,
        content: buttonYaks[Math.floor(Math.random() * buttonYaks.length)],
        id: uuidv4(),
        score: Math.floor(Math.random() * 20),
      });

  if (newYaks.length > 4) {
    newYaks.shift();
  }

  setYaks(newYaks);
};

const YakFeed = ({ yaks }: { yaks: Yak[] }) => (
  <div className="toast">
    {yaks.map((yak) => (
      <div
        key={yak.id}
        className={`alert w-72 flex-row items-center shadow-xl ${
          yak.button ? "alert-error" : ""
        }`}
      >
        <span>{yak.content}</span>
        <div className="flex flex-col">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-chevron-up -my-4"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
          <span className="text-sm">{yak.score}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-chevron-down -my-4"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    ))}
  </div>
);
