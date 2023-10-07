const Web3 = require('web3');


// url: "http://157.230.242.107:8545",
const nodeUrl = "http://157.230.242.107:8545"; // Replace with your Ethereum node's URL
// const nodeUrl = 'https://chain.reliefer.online:8545'; // Replace with your Ethereum node's URL
const web3 = new Web3(nodeUrl);

async function getNodeInfo() {
  try {
    const nodeInfo = await web3.eth.getNodeInfo();
    console.log('Node Info:', nodeInfo);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function to get node info
getNodeInfo();