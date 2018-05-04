'use strict';

module.exports = function() {
    var request = require('request-promise');
    var cheerio = require('cheerio');
    const { JSDOM } = require('jsdom');

    let timeEditLink = 'https://se.timeedit.net';
    let link;
    let html;
    
    request('https://se.timeedit.net/web/lnu/db1/schema1/', function(err, resp, html) {
            if (!err){
              const $ = cheerio.load(html);
              const searchLink = $('.leftlistcolumn').find('a').attr('href');
              link = timeEditLink + searchLink;
          }
    }).then(function() {
        request(link, function(err, resp, html) {
            if (!err){
                const $ = cheerio.load(html);
                let roomName = 'Ny231';
                let changeName = $('#ffsearchname').attr('value', roomName);
                let test = $('.infoboxtitle').children();
                console.log(test);
                html = $.html()
          }
    }).then(function() {
        const dom = new JSDOM(html);
        //TODO
        //FIXA SÅ DET GÅR ATT KLICKA PÅ KNAPPEN FÖR ATT SÖKA
        //SEN VÄLJA VÄRDET I SÖKRESULTAT
        //SEN KLICKA PÅ VISA SCHEMA
    })
    })
}


    

