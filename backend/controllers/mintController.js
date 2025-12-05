const Mint = require('../models/Mint');

exports.saveMintTransaction = async (req, res) => {
  try {
    const { txHash, from, to, amount, tokenSymbol = 'SMT' } = req.body;

    // Validate required fields
    if (!txHash || !from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required fields: txHash, from, to, amount' });
    }

    // Check if transaction already exists
    const existingMint = await Mint.findOne({ txHash });
    if (existingMint) {
      return res.status(400).json({ error: 'Transaction already recorded' });
    }

    // Create new mint record
    const mint = new Mint({
      txHash,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      amount,
      tokenSymbol,
      status: 'pending',
    });

    await mint.save();

    res.status(201).json({
      message: 'Mint transaction saved successfully',
      data: mint,
    });
  } catch (err) {
    console.error('Error saving mint transaction:', err);
    res.status(500).json({ error: 'Failed to save mint transaction', details: err.message });
  }
};

exports.updateMintStatus = async (req, res) => {
  try {
    const { txHash, status, blockNumber, gasUsed } = req.body;

    if (!txHash || !status) {
      return res.status(400).json({ error: 'Missing required fields: txHash, status' });
    }

    const validStatuses = ['pending', 'confirmed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: pending, confirmed, or failed' });
    }

    const mint = await Mint.findOneAndUpdate(
      { txHash },
      { status, blockNumber, gasUsed },
      { new: true }
    );

    if (!mint) {
      return res.status(404).json({ error: 'Mint transaction not found' });
    }

    res.json({
      message: 'Mint status updated successfully',
      data: mint,
    });
  } catch (err) {
    console.error('Error updating mint status:', err);
    res.status(500).json({ error: 'Failed to update mint status', details: err.message });
  }
};

exports.getMintHistory = async (req, res) => {
  try {
    const { address, limit = 10, page = 1 } = req.query;

    let query = {};
    if (address) {
      const lowerAddress = address.toLowerCase();
      query = {
        $or: [{ from: lowerAddress }, { to: lowerAddress }],
      };
    }

    const skip = (page - 1) * limit;

    const mints = await Mint.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Mint.countDocuments(query);

    res.json({
      data: mints,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching mint history:', err);
    res.status(500).json({ error: 'Failed to fetch mint history', details: err.message });
  }
};

exports.getMintById = async (req, res) => {
  try {
    const { txHash } = req.params;

    const mint = await Mint.findOne({ txHash });

    if (!mint) {
      return res.status(404).json({ error: 'Mint transaction not found' });
    }

    res.json({ data: mint });
  } catch (err) {
    console.error('Error fetching mint transaction:', err);
    res.status(500).json({ error: 'Failed to fetch mint transaction', details: err.message });
  }
};