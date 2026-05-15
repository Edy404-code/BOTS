const { MessageMedia } = require('whatsapp-web.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {

    oi: async (msg) => {
        msg.reply('Olá 👋');
    }

};
