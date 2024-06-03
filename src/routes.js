const express = require('express');
const { identify } = require('../src/controller');

const router = express.Router();

router.post('/', identify);

module.exports = router;
