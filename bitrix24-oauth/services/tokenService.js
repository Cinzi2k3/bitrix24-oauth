const fs = require('fs').promises;

//Lưu trữ token vào file tokens.json
exports.saveTokens = async (tokens) => await fs.writeFile('tokens.json', JSON.stringify(tokens, null, 2));

//Đoc token từ file tokens.json
exports.loadTokens = async () => {
  try {
    return JSON.parse(await fs.readFile('tokens.json', 'utf8'));
  } catch {
    return null;
  }
};
