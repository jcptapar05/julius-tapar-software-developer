const express = require('express');
const router = express.Router();
const {
  getEthPrice,
  getGasInfo,
  getBlockNumber,
  getBalance,
} = require('../controllers/ethController');
const {
  saveMintTransaction,
  updateMintStatus,
  getMintHistory,
  getMintById,
} = require('../controllers/mintController');

// ETH routes
router.get('/price', getEthPrice);
router.get('/gas', getGasInfo);
router.get('/block', getBlockNumber);
router.get('/balance/:address', getBalance);

// Mint routes
router.post('/mint/save', saveMintTransaction);
router.put('/mint/status', updateMintStatus);
router.get('/mint/history', getMintHistory);
router.get('/mint/:txHash', getMintById);

module.exports = router;