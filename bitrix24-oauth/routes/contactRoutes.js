const express = require('express');
const router = express.Router();
const { getContacts, addContact, updateContact, deleteContact } = require('../controllers/contactController');

router.get('/contacts', getContacts);
router.post('/add', addContact);
router.put('/update/:id', updateContact);
router.delete('/delete/:id', deleteContact);

module.exports = router;
