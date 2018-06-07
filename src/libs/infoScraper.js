'use strict';

let puppeteer = require('puppeteer');

let scrape = async (roomName) => {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    let url = 'https://se.timeedit.net/web/lnu/db1/schema1';
    try {

        await page.goto(url);

        // Gå till: Schema och visning av bokningar...
        await page.click('#contents > div.linklist > div > div:nth-child(1) > a:nth-child(1)');

        await page.waitFor(2000);

        // Ändra till Lokal sökning
        await page.select('#fancytypeselector', '4');

        await page.waitFor(2000);

        await page.evaluate((roomName) => {
            // Sätter lokalens namn
            document.querySelector('#ffsearchname').value = roomName;

            // Klicka på SÖK knappen
            document.querySelector('.ffsearchbutton.objectsearchbutton').click();
        }, roomName);

        await page.waitFor(1000);

        await page.evaluate(() => {
            // Välj sökresultat
            document.querySelector('#objectbasketitemX0').click();

            // Klicka på Visa Schema
            document.querySelector('#objectbasketgo').click();
        });

        await page.waitFor(1000);

        await page.evaluate(() => {
            // klicka upp info fönster
            document.querySelector('.column0.columnLine.nw.c0.la1').click();
        });

        await page.waitFor(1000);

        let newUrl = await page.evaluate((roomName) => {
            // skriver ut info som finns i första pop-up ruta
            let iframe = document.getElementById('fancybox-frame');
            let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            let iframeP = iframeDoc.querySelector('.infoboxtd');

            let elements = Array.from(iframeP.querySelectorAll('a'));
            // ful lösning, men kollar så att länken är samma som lokalens namn, ifall de finns fler lokaler på bokningen
            let links = elements.map(element => {
                if (element.textContent == roomName) {
                    return element.href;
                }
            })
            return links;
        }, roomName);

        for (let i = 0; i < newUrl.length; i++) {
            if (newUrl[i] !== null) {
                // gå till info sidan
                await page.goto(newUrl[i]);
            }
        }

        await page.waitFor(1000);

        let table = await page.evaluate(() => {
            // ta fram "info table"
            let lists = document.querySelector('.objectfieldsextra');
            let roomList = [];

            for (let i = 0; i < lists.childElementCount; i++) {
                roomList.push(lists.children[i].textContent);
            }

            return roomList;
        });

        let context = {};

        for (let i = 0; i < table.length; i++) {
            let list = table[i].replace(/\s+/g, ' ');
            list = list.split(' ');

            for (let i = 0; i < table.length; i++) {
                let list = table[i].replace(/\s+/g, ' ');
                list = list.split(' ');

                for (let j = 0; j < list.length; j++) {
                    if (list[j] === 'Namn') {
                        context.name = list[j + 1];
                    }
                    if (list[j] === 'Storlek') {
                        context.size = list[j + 1];
                    }
                    if (list[j] === 'Dator') {
                        context.equipment = list[j];
                    }
                }
            }
        }

        await page.waitFor(2000);

        browser.close();

        // skickar ut info om rummet
        return context;
    } catch (err) {
        console.log('err');
    }
}

module.exports = scrape;