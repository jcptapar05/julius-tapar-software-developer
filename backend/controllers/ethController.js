const axios = require("axios");
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");

exports.getEthPrice = async (req, res) => {
  try {
    const resp = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    res.json({
      ethPriceUSD: resp.data.ethereum.usd,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ETH price", details: err });
  }
};

exports.getGasInfo = async (req, res) => {
  try {
    const block = await provider.getBlock("latest");

    const baseFee = block.baseFeePerGas;
    const priorityFee = ethers.parseUnits("2", "gwei");

    const maxFee = baseFee + priorityFee;

    res.json({
      baseFeePerGasGwei: ethers.formatUnits(baseFee, "gwei"),
      priorityFeePerGasGwei: ethers.formatUnits(priorityFee, "gwei"),
      maxFeePerGasGwei: ethers.formatUnits(maxFee, "gwei"),
      baseFeePerGasWei: baseFee.toString(),
      priorityFeePerGasWei: priorityFee.toString(),
      maxFeePerGasWei: maxFee.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gas info", details: err });
  }
};

exports.getBlockNumber = async (req, res) => {
  try {
    const blockNumber = await provider.getBlockNumber();
    res.json({ blockNumber });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch block number", details: err });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);

    res.json({
      address,
      balanceWei: balanceWei.toString(),
      balanceEth,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch balance", details: err });
  }
};