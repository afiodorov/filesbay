import { EthContext, ctx } from "./ethContext";
import React, { useContext } from "react";
import { BigNumberish, Contract } from "ethers";
import SellNew from "./sellNew";
import { EditableItem } from "./sellNew";
import listings_abi_v1 from "./abi/listings.abi.json";
import Async from "react-async";

const Item: React.FC<{ contract: Contract; itemNum: BigNumberish }> = (
  props
) => {
  const { address, formatPrice, namePrice } = useContext(EthContext) as ctx;

  return (
    <Async
      key={props.itemNum.toString()}
      promiseFn={async () => {
        const res = await (props.contract as any).fileIndicesByAddress(
          address,
          props.itemNum
        );
        const file = (await (props.contract as any).files(res)) as Array<any>;

        return file;
      }}
    >
      <Async.Pending>
        <>Loading item {props.itemNum}...</>
      </Async.Pending>
      <Async.Fulfilled>
        {(data: Array<any>) => {
          return (
            <EditableItem
              title={data[0]}
              desc={data[1]}
              price={formatPrice.get(data[3])?.call(null, data[2])!}
              currency={namePrice.get(data[3])!}
              encryptedMessage={data[6]}
            />
          );
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        {(error) => {
          return (
            <>
              Error getting item {props.itemNum}: {JSON.stringify(error)}
            </>
          );
        }}
      </Async.Rejected>
    </Async>
  );
};

const AllItems: React.FC<{ contract: Contract }> = (props) => {
  const { address } = useContext(EthContext) as ctx;

  if (!address) {
    return <></>;
  }

  return (
    <>
      <Async
        promiseFn={async () =>
          await (props.contract as any).numFilesByAddress(address)
        }
      >
        <Async.Resolved>
          {(data: bigint) => {
            const rows = [];
            for (let i = data - 1n; i >= 0; i--) {
              rows.push(Item({ contract: props.contract, itemNum: i }));
            }
            if (rows.length > 0) {
              return (
                <>
                  <h1>Selling Items</h1>
                  {rows}
                </>
              );
            }

            return <></>;
          }}
        </Async.Resolved>
        <Async.Loading>LOADING</Async.Loading>
      </Async>
    </>
  );
};

export default () => {
  const { config, provider } = useContext(EthContext) as ctx;

  const listingContract = new Contract(
    config.contractAddress,
    listings_abi_v1,
    provider
  );

  return (
    <>
      <SellNew />
      <AllItems contract={listingContract} />
    </>
  );
};
