import './App.css';
import logo from './images/logo_2.png';
import hero from './images/marketplace_hero5.png';

import Collection from './Collection.js';
import SaleCollection from './SaleCollection.js';

import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { useState, useEffect } from 'react';
import { create } from 'ipfs-http-client';
import { mintNFT } from './cadence/transactions/mint_nft.js';
import { setupUserTx } from './cadence/transactions/setup_user.js';
import { listForSaleTx } from './cadence/transactions/list_for_sale.js';

const client = create('https://ipfs.infura.io:5001/api/v0');

fcl
  .config()
  .put('accessNode.api', 'https://access-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn');

function App() {
  const [user, setUser] = useState();
  const [nameOfNFT, setNameOfNFT] = useState('');
  const [file, setFile] = useState();
  const [id, setID] = useState();
  const [price, setPrice] = useState();
  const [address, setAddress] = useState();
  const [officialAddress, setOfficialAddress] = useState('');

  useEffect(() => {
    // sets the `user` variable to the person that is logged in through Blocto
    fcl.currentUser().subscribe(setUser);
  }, []);

  const logIn = () => {
    // log in through Blocto
    fcl.authenticate();
  };

  const mint = async () => {
    try {
      const added = await client.add(file);
      const hash = added.path;

      const transactionId = await fcl
        .send([
          fcl.transaction(mintNFT),
          fcl.args([fcl.arg(hash, t.String), fcl.arg(nameOfNFT, t.String)]),
          fcl.payer(fcl.authz),
          fcl.proposer(fcl.authz),
          fcl.authorizations([fcl.authz]),
          fcl.limit(9999),
        ])
        .then(fcl.decode);

      console.log(transactionId);
      return fcl.tx(transactionId).onceSealed();
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  };

  const setupUser = async () => {
    const transactionId = await fcl
      .send([
        fcl.transaction(setupUserTx),
        fcl.args([]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);

    console.log(transactionId);
    return fcl.tx(transactionId).onceSealed();
  };

  const listForSale = async () => {
    const transactionId = await fcl
      .send([
        fcl.transaction(listForSaleTx),
        fcl.args([fcl.arg(parseInt(id), t.UInt64), fcl.arg(price, t.UFix64)]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);

    console.log(transactionId);
    return fcl.tx(transactionId).onceSealed();
  };

  return (
    <div className="App">
      <nav className="nav">
        <div>
          <img src={logo} alt="Logo" className="logo" />
          <h3>GrantMarketplace</h3>
        </div>
        <div>
          <h4>Account address: {user && user.addr ? user.addr : ''}</h4>
          <button className="logBtn" onClick={() => logIn()}>
            Log In
          </button>
          <button className="logBtn" onClick={() => fcl.unauthenticate()}>
            Log Out
          </button>
        </div>
      </nav>

      <div className="hero">
        <div className="container">
          <p>
            Discover, Collect, <br /> and Sell Varius <br /> Extraordinary NFTs
          </p>
          <div>
            <button id="createEmpty" onClick={() => setupUser()}>
              Create empty NFT collection
            </button>
            <div>
              <div>
                <input
                  placeholder="Name of NFT"
                  type="text"
                  onChange={(e) => setNameOfNFT(e.target.value)}
                />
                <label for="file-upload" class="custom-file-upload">
                  NFT Artwork Upload
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <button onClick={() => mint()}>Mint</button>
              </div>
              <div>
                <input
                  placeholder="ID of NFT to list for sale"
                  type="text"
                  onChange={(e) => setID(e.target.value)}
                />
                <input
                  placeholder="Price in FlowToken"
                  type="text"
                  onChange={(e) => setPrice(e.target.value)}
                />
                <button onClick={() => listForSale()}>List NFT for Sale</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <img className="heroImg" src={hero} alt="hero_image"></img>
        </div>
      </div>

      <div className="searchContainer">
        <div className="search">
          <input
            placeholder="Search for NFT's by user's Address"
            type="text"
            onChange={(e) => setAddress(e.target.value)}
          />
          <button onClick={() => setOfficialAddress(address)}>Search</button>
        </div>
      </div>

      <div></div>

      <div className="collectionContainer">
        <h1 className="collection">My NFT Collection</h1>
        {user && user.addr && officialAddress && officialAddress !== '' ? (
          <Collection address={officialAddress}></Collection>
        ) : null}

        <h1 className="collection">Sale Collection</h1>
        {user && user.addr && officialAddress && officialAddress !== '' ? (
          <SaleCollection address={officialAddress}></SaleCollection>
        ) : null}
      </div>
    </div>
  );
}

export default App;
