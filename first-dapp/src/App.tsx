import React, { useEffect, useState } from 'react';
import { Types, AptosClient, TokenClient, TransactionBuilderABI } from 'aptos';
import './App.css';

const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');
const tokenClient = new TokenClient(client);

function App() {
  // Retrieve aptos.account on initial render and store it.
  const [address, setAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<Types.AccountData | null>(null);
  //MoveModule -> MoveModuleBytecode
  const [modules, setModules] = useState<Types.MoveModuleBytecode[]>([]);
  //AccountResource -> MoveResource
  const [resources, setResources] = useState<Types.MoveResource[]>([]);

  useEffect(() => {
    if (!address) return;
    client.getAccountResources(address).then(setResources);
  }, [address]);
  const resourceType = `${address}::message::MessageHolder`;
  const resource = resources.find((r) => r.type === resourceType);
  const data = resource?.data as { message: string } | undefined;
  const message = data?.message;

  //
  useEffect(() => {
    window.aptos.connect();
    window.aptos.account().then((data: { address: string }) => setAddress(data.address));
  }, []);

  useEffect(() => {
    if (!address) return;
    client.getAccount(address).then(setAccount);
  }, [address]);

  useEffect(() => {
    if (!address) return;
    client.getAccountModules(address).then(setModules);
  }, [address]);

  const hasModule = modules.some((m) => m.abi?.name === 'message');
  const publishInstructions = (
    <pre>
      Run this command to publish the module:
      <br />
      aptos move publish --package-dir /path/to/hello_blockchain/
      --named-addresses HelloBlockchain={address}
    </pre>
  );

  const ref = React.createRef<HTMLTextAreaElement>();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!ref.current) return;

    const message = ref.current.value;
    const transaction = {
      type: "entry_function_payload",
      function: `${address}::message::set_message`,
      arguments: [stringToHex(message)],
      type_arguments: [],
    };

    try {
      setIsSaving(true);
      await window.aptos.signAndSubmitTransaction(transaction);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTxTest = async () => {
    const name = "nftTest1";
    const description = "nftTest1";
    const uri = "uri1";
    const maxAmount = "1000";
    const arr = [false, false, false, false, false];
    const tx = {
      type: "entry_function_payload",
      function: `0x3::token::create_collection_script`,
      arguments: [name, description, uri, maxAmount, arr],
      type_arguments: [],
    }
    await window.aptos.signAndSubmitTransaction(tx);
  }

  const handleCreateToken = async () => {
    if (!address) return;
    const collectionName = "nftTest1";
    const tokenName = "tokenName1";
    const description = "token desc1";
    const uri = "uri1";
    const maxAmount = "1000";
    const supply = 1;
    const arr = [false, false, false, false, false];
    const royalty_points_denominator = 100;
    const royalty_points_numerator = 5;// 5%
    const tx = {
      type: "entry_function_payload",
      function: `0x3::token::create_token_script`,
      arguments: [
        collectionName, 
        tokenName, 
        description, 
        supply, 
        maxAmount, 
        uri, 
        address,
        royalty_points_denominator,
        royalty_points_numerator, 
        arr,
        [],
        [],
        [],
      ],
      type_arguments: [],
    }
    await window.aptos.signAndSubmitTransaction(tx);
  }

  const callTest = async () => {
    const creatorHex = "0x10656bc042639da94238e21f0ba00779d103ee7150a316f1c82b3319b1db6824"
    const collection: { type: Types.MoveStructTag; data: any } = await client.getAccountResource(
      creatorHex,
      "0x3::token::Collections",
    );
    const { handle } = collection.data.token_data;
    const collectionName = "nftTest1";
    const tokenName = "tokenName1";
    const tokenDataId = {
      creator: creatorHex,
      collection: collectionName,
      name: tokenName,
    };

    const getTokenTableItemRequest: Types.TableItemRequest = {
      key_type: "0x3::token::TokenDataId",
      value_type: "0x3::token::TokenData",
      key: tokenDataId,
    };

    const result = await client.getTableItem(handle, getTokenTableItemRequest);
    console.log(result);
  }

  const balanceOf = async () => {
    if (!address) return;
    const token = await tokenClient.getToken(
      address,
      "nftTest1",
      "tokenName1",
      "0"
    )
    console.log(token);
    console.log(`balance: `);
  }

  return (
    <div className="App">
      <p><code>{address}ss</code></p>
      <p><code>{account?.sequence_number}</code></p>
      {!hasModule && publishInstructions}
      {hasModule === true ? (
        <form onSubmit={handleSubmit}>
          <textarea ref={ref} />
          <input disabled={isSaving} type="submit" />
        </form>
      ) : publishInstructions}
      <textarea defaultValue={message} />
      <button onClick={handleTxTest}>txTest</button>
      <button onClick={handleCreateToken}>createTokenTest</button>
      <button onClick={callTest}>callTest</button>
      <button onClick={balanceOf}>balance</button>
    </div>
  );
}

function stringToHex(text: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  return Array.from(encoded, (i) => i.toString(16).padStart(2, "0")).join("");
}

export default App;

