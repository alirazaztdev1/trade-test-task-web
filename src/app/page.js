'use client';
import { useEffect, useState } from 'react';
import './globals.css';

export default function Home() {
  const [tradeDetails, setTradeDetails] = useState();
  const [status, setStatus] = useState('Connecting to Backend...');
  const [ws, setWs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log(status);

  useEffect(() => {
    const webSocket = new WebSocket(process.env.NEXT_PUBLIC_WEB_SOCKET_URL);
    setWs(webSocket);

    webSocket.onopen = () => {
      setStatus('Connected to Backend...');
    };

    webSocket.onmessage = (event) => {
      if (event.data === 'Connected to Backend...') {
        setStatus(event.data);
      } else {
        console.log('Successfully Replicated Master Trad');
        console.log('Displaying Trade Details');
        const tradeData = JSON.parse(event.data);
        setTradeDetails(JSON.stringify(tradeData, null, 2));
        console.log(JSON.stringify(tradeData, null, 2));
        setIsLoading(false);
      }
    };

    webSocket.onerror = (error) => {
      setStatus('WebSocket error');
    };

    webSocket.onclose = () => {
      setStatus('Connection closed. Reconnecting...');
      // setTimeout(() => {
      //   window.location.reload();
      // }, 10000);
    };

    return () => {
      webSocket.close();
    };
  }, []);

  const handleTrade = () => {
    setIsLoading(true);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Pinging Lambda Function');
      setTradeDetails('TRADING...');
      console.log('Replicating Master Trad');
      ws.send(JSON.stringify('trade'));
    } else {
      setIsLoading(false);
      console.error('WebSocket is not open.');
    }
  };

  return (
    <div className='flex p-10 items-start justify-between h-full bg-white gap-10'>
      <div className='flex flex-col justify-between w-[500px] h-full min-h-[500px] bg-gray-300 p-4 mb-4 text-left'>
        <h2 className='font-bold mb-10'>YOUR TRADE DETAILS</h2>
        <pre className='whitespace-pre-wrap'>{tradeDetails}</pre>
      </div>
      <div className='h-full min-h-[500px] flex flex-col justify-between'>
        <div></div>
        {isLoading ? (
          <button className='w-40 h-12 bg-gray-300 hover:bg-gray-400 transition-colors duration-200 flex items-center justify-center text-lg'>
            LOADING...
          </button>
        ) : (
          <button
            className='w-40 h-12 bg-gray-300 hover:bg-gray-400 transition-colors duration-200 flex items-center justify-center text-lg'
            onClick={handleTrade}
          >
            TRADE →
          </button>
        )}
      </div>
    </div>
  );
}
