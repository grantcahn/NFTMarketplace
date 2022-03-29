import './App.css';

import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { useState, useEffect } from 'react';
import { getSaleNFTsScript } from './cadence/scripts/get_sale_nfts';
import { purchaseTx } from './cadence/transactions/purchase.js';
import { unlistFromSaleTx } from './cadence/transactions/unlist_from_sale.js';

function SaleCollection(props) {
  const [nfts, setNFTs] = useState([]);

  useEffect(() => {
    getUserSaleNFTs();
  }, []);

  const getUserSaleNFTs = async () => {
    const result = await fcl
      .send([
        fcl.script(getSaleNFTsScript),
        fcl.args([fcl.arg(props.address, t.Address)]),
      ])
      .then(fcl.decode);

    console.log(result);
    setNFTs(result);
  };

  const purchase = async (id) => {
    const transactionId = await fcl
      .send([
        fcl.transaction(purchaseTx),
        fcl.args([
          fcl.arg(props.address, t.Address),
          fcl.arg(parseInt(id), t.UInt64),
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);

    console.log(transactionId);
    return fcl.tx(transactionId).onceSealed();
  };

  const unlistFromSale = async (id) => {
    const transactionId = await fcl
      .send([
        fcl.transaction(unlistFromSaleTx),
        fcl.args([fcl.arg(parseInt(id), t.UInt64)]),
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
    <div className="nftcollection">
      {Object.keys(nfts).map((nftID) => (
        <div className="nftcard-border-wrap">
          <div className="nftcard" key={nftID}>
            <img
              style={{ height: '150px' }}
              src={`https://ipfs.infura.io/ipfs/${nfts[nftID].nftRef.ipfsHash}`}
            />
            <h1>Name: {nfts[nftID].nftRef.metadata.name}</h1>
            <h1>Price: {nfts[nftID].price}</h1>
            <button className="nftbutton" onClick={() => purchase(nftID)}>
              Purchase this NFT
            </button>
            <button className="nftbutton" onClick={() => unlistFromSale(nftID)}>
              Unlist this NFT for Sale
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SaleCollection;
