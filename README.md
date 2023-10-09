# l2-bridge



## Getting started

Step 1: Please clone this repo by running the following command:

```
git clone https://github.com/zlog-in/op-l2-bridge.git
```
Step 2: Create a file `.env` in the root of the project and copy the content of `.env.example` into it. Then fill the `PRIVATE_KEY` with your privakte key. And set proper `L1_RPC_URL` and `L2_RPC_URL` if you can't use the default values.

Step 3: Install dependencies by running the following command:

```
npm install
```

## Report Balance
To get the available balance of the account on both L1 and L2, run the following command:

```
node index.js balance
```

## Deposit ETH from L1 to L2
To deposit ETH from L1 to L2, run the following command:

```
node index.js deposit <amount in gwei>
```
For eample, to deposit 0.1 ETH, run the following command:

```
node index.js deposit 100000000
```
It will take few minutes to complete the deposit flow, an example output is as follows:

```
➜  l2-bridge git:(main) ✗ node index.js deposit 300000000
Deposit ETH
On L1:1325013677 Gwei    On L2:8995461259 Gwei
Transaction hash (on L1): 0x440a8eb556d64fcbf31e1997717455049f5fb44772c64cec57d69416c76b8feb
Waiting for status to change to RELAYED
Time so far 15.96 seconds
On L1:1024027047 Gwei    On L2:9295461259 Gwei
depositETH took 98.479 seconds
```
This deposit transaction is recorded on the [explorer](https://sepolia.etherscan.io/tx/0x440a8eb556d64fcbf31e1997717455049f5fb44772c64cec57d69416c76b8feb)
## Withdraw ETH from L2 to L1
To withdraw ETH from L2 to L1, run the following command:

```
node index.js withdraw <amount in gwei>
```
For eample, to withdraw 0.1 ETH, run the following command:

```
node index.js withdraw 100000000
```
It will take one or two hourse to complete the withdraw flow due to the challenge period, an example output is as follows:

```
➜  l2-bridge git:(main) ✗ node index.js withdraw 300000000
Withdraw ETH
On L1:1024027047 Gwei    On L2:9295461259 Gwei
Transaction hash (on L2): 0xb1783e52568f05b18a481682c3dce2dcf4b409e4a86e440143f5c8e20d03c29e
Waiting for status to be READY_TO_PROVE
Time so far 3.869 seconds
Time so far 2157.094 seconds
In the challenge period, waiting for status READY_FOR_RELAY
Time so far 2161.509 seconds
Ready for relay, finalizing message now
Time so far 5765.458 seconds
Waiting for status to change to RELAYED
Time so far 5769.356 seconds
On L1:1323440459 Gwei    On L2:8995285333 Gwei
withdrawETH took 5779.873 seconds
```
This withraw transaction is recorded on the [explorer](https://explorerl2new-orderly-sepolia-esizdetout.t.conduit.xyz/tx/0xb1783e52568f05b18a481682c3dce2dcf4b409e4a86e440143f5c8e20d03c29e)
