#! /usr/local/bin/node

// Transfers between L1 and L2 using the Optimism SDK

const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")
const conduitSDK = require('@conduitxyz/sdk');
require('dotenv').config()

// Network information and utilities for this example network are available
// here: https://app.conduit.xyz/published/view/conduit-opstack-demo-nhl9xsg0wg

// Your settlment layer rpc url here
const l1Url = process.env.L1_URL
// Your conduit rpc url here
// const l2Url = `https://l2-conduit-opstack-demo-nhl9xsg0wg.t.conduit.xyz`
const l2Url = process.env.L2_URL
const privateKey = process.env.PRIVATE_KEY

// Global variable because we need them almost everywhere
let crossChainMessenger
let addr    // Our address

const getSigners = async () => {
    const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
    const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
    const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
    const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

    return [l1Wallet, l2Wallet]
}   // getSigners

const setup = async() => {
  const [l1Signer, l2Signer] = await getSigners()
  addr = l1Signer.address
  // The network slug is available in the Network Information tab here: https://app.conduit.xyz/published/view/orderly-goerli-g4nyt6i6my
//   let config = await conduitSDK.getOptimismConfiguration(`conduit:orderly-l2-4460-sepolia-8tc3sd7dvy);
  let config = await conduitSDK.getOptimismConfiguration(`conduit:${process.env.CONDUIT_KEY}`);
  config.l1SignerOrProvider = l1Signer
  config.l2SignerOrProvider = l2Signer
    
  crossChainMessenger = new optimismSDK.CrossChainMessenger(config)
}    // setup

const gwei = BigInt(1e9)
const eth = gwei * gwei   // 10^18
const centieth = eth/100n


const reportBalances = async () => {
  const l1Balance = (await crossChainMessenger.l1Signer.getBalance()).toString().slice(0,-9)
  const l2Balance = (await crossChainMessenger.l2Signer.getBalance()).toString().slice(0,-9)

  console.log(`On L1:${l1Balance} Gwei    On L2:${l2Balance} Gwei`)
}    // reportBalances


const depositETH = async (amount) => {

  console.log("Deposit ETH")
  await reportBalances()
  const start = new Date()
  
  const response = await crossChainMessenger.depositETH(BigInt(amount)*gwei)
  console.log(`Transaction hash (on L1): ${response.hash}`)
  await response.wait()
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
                                                  optimismSDK.MessageStatus.RELAYED)

  await reportBalances()
  console.log(`depositETH took ${(new Date()-start)/1000} seconds\n\n`)
}     // depositETH()

const withdrawETH = async (amount) => { 
  console.log("Withdraw ETH")
  const start = new Date()  
  await reportBalances()

  const response = await crossChainMessenger.withdrawETH(BigInt(amount) * gwei)
  console.log(`Transaction hash (on L2): ${response.hash}`)
  await response.wait()

  console.log("Waiting for status to be READY_TO_PROVE")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash, 
    optimismSDK.MessageStatus.READY_TO_PROVE)
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.proveMessage(response.hash)

  console.log("In the challenge period, waiting for status READY_FOR_RELAY") 
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response.hash, 
                                                optimismSDK.MessageStatus.READY_FOR_RELAY) 
  console.log("Ready for relay, finalizing message now")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.finalizeMessage(response)
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date()-start)/1000} seconds`)  
  await crossChainMessenger.waitForMessageStatus(response, 
    optimismSDK.MessageStatus.RELAYED)
  await reportBalances()   
  console.log(`withdrawETH took ${(new Date()-start)/1000} seconds\n\n\n`)  
}     // withdrawETH()


const main = async () => {
    await setup()
    if (process.argv[2] === "balance") {
      await reportBalances()
      return
    }
    else if (process.argv[2] === "deposit" && process.argv[3] > 0) {
      await depositETH(process.argv[3])
      return
    }
    else if (process.argv[2] === "withdraw" && process.argv[3] > 0) {
      await withdrawETH(process.argv[3])
      return
    }
    else if (process.argv[2] === "finalize" && process.argv[3] > 0) {
      await crossChainMessenger.finalizeMessage(process.argv[3])
      await crossChainMessenger.waitForMessageStatus(process.argv[3], 
        optimismSDK.MessageStatus.RELAYED)
    }
    else if (process.argv[2] === "prove" && process.argv[3] > 0) {
      await crossChainMessenger.proveMessage(process.argv[3])
      // await crossChainMessenger.waitForMessageStatus(process.argv[3], optimismSDK.MessageStatus.READY_FOR_RELAY)
    }
}  // main



main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })





