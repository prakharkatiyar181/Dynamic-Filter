const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  const dbPath = path.resolve(process.cwd(), 'mock', 'db.json');

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const json = JSON.parse(raw);
    const employees = Array.isArray(json?.employees) ? json.employees : [];
    res.status(200).json(employees);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read mock/db.json' });
  }
};
