import './App.css';

import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { useState, useEffect } from 'react';
import { getNFTsScript } from './cadence/scripts/get_nfts.js';

function Collection(props) {
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    getUserNFTs();
  }, []);

  const getUserNFTs = async () => {
    const result = await fcl
      .send([
        fcl.script(getNFTsScript),
        fcl.args([fcl.arg(props.address, t.Address)]),
      ])
      .then(fcl.decode);

    console.log(result);
    setNFTs(result);
  };

  return (
    <div className="nftcollection">
      {nfts.map((nft) => (
        <div className="nftcard-border-wrap">
          <div className="nftcard" key={nft.id}>
            <img
              style={{ height: '150px' }}
              src={`https://ipfs.infura.io/ipfs/${nft.ipfsHash}`}
            />
            <h1>ID: {nft.id}</h1>
            <h1>Name: {nft.metadata.name}</h1>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Collection;
