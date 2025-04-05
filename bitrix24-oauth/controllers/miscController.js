const { callApi } = require('../services/bitrixApi');

/// Lấy danh sách tên các trường trong contact
exports.getContactFields = async (req, res) => {
  try {
    const data = await callApi('crm.contact.fields');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Test API
exports.testApi = async (req, res) => {
  const data = await callApi('crm.contact.list');
  res.json(data);
};
