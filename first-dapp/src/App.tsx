import React, {useEffect, useState} from 'react';
import { Types, AptosClient } from 'aptos';
import './App.css';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');

function App() {
  // Retrieve aptos.account on initial render and store it.
  const [address, setAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<Types.AccountData | null>(null);

  useEffect(() => {
    window.aptos.connect();
    window.aptos.account().then((data : {address: string}) => setAddress(data.address));
  }, []);

  useEffect(() => {
    if (!address) return;
    client.getAccount(address).then(setAccount);
  }, [address]);

  return (
    <div className="App">
      <p><code>{address}ss</code></p>
      <p><code>{ account?.sequence_number }</code></p>
    </div>
  );
}

export default App;

