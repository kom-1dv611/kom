'use strict';

const cheerio = require('cheerio');
const rp = require('request-promise');

const puppeteer = require('puppeteer');


const LNU_ROOM_URL = 'https://lnu.se/sok/?q=grupprum&main=Karta&locationcity=Kalmar&s=alphabeticallyasc';

module.exports = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://lnu.se/sok/?q=grupprum&main=Karta&locationcity=Kalmar&p=2&s=alphabeticallyasc');

    try {
    
        const finder = await page.evaluate(() => {
            let lists = document.querySelector('.content-list > ul');
            let roomList = [];

            for (let i = 0; i < lists.childElementCount; i++) {
                roomList.push(lists.children[i].textContent)
            }

            return roomList;
        });

        let rooms = [];

        for (let i = 0; i < finder.length; i++) {
            let room = finder[i].replace(/\t/g, '');
            room = room.replace(/(\r\t\n|\n|\r\t)/gm,' ');
            room = room.split(' ');

            let roomObject = {};

            roomObject.name = room[2];
            roomObject.city = room[3];
            roomObject.type = room[6];
            roomObject.floor_type = room[7];
            roomObject.floor = room[8];
            roomObject.location = room[9];

            rooms.push(roomObject);

            console.log(room)
        }

        

        browser.close();

        return rooms;

    } catch (error) {
        console.log(error)
    }
};




