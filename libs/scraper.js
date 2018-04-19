'use strict';

const puppeteer = require('puppeteer');

const LNU_KALMAR_ROOMS = [
    'https://lnu.se/sok/?q=grupprum&main=Karta&locationcity=Kalmar&s=alphabeticallyasc',
    'https://lnu.se/sok/?q=grupprum&main=Karta&locationcity=Kalmar&p=1&s=alphabeticallyasc',
    'https://lnu.se/sok/?q=grupprum&main=Karta&locationcity=Kalmar&p=2&s=alphabeticallyasc',
    'https://lnu.se/sok/?q=grupprum&main=Karta&locationcity=Kalmar&p=3&s=alphabeticallyasc'
];

module.exports = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let rooms = [];
    
    for (let i = 0; i < LNU_KALMAR_ROOMS.length; i++) {
        
        await page.goto(LNU_KALMAR_ROOMS[i]);

        try {
            const finder = await page.evaluate(() => {
                let lists = document.querySelector('.content-list > ul');
                let roomList = [];
    
                for (let i = 0; i < lists.childElementCount; i++) {
                    roomList.push(lists.children[i].textContent)
                }
    
                return roomList;
            });

    
            
            for (let i = 0; i < finder.length; i++) {
                let room = finder[i].replace(/\t/g, '');
                room = room.replace(/(\r\t\n|\n|\r\t)/gm,' ');
                room = room.split(' ');
    
                let roomObject = {};
    
                //Fula lösningar nedan
                if (room[2] == 'Grupprum') {
                    roomObject.name = room[3];
                    roomObject.city = room[4];
                    roomObject.type = room[7];
                    roomObject.floor_type = room[8];
                    roomObject.floor_level = room[9];
                    roomObject.location = room[10];
                } else {
                    roomObject.name = room[2];
                    roomObject.city = room[3];
                    roomObject.type = room[6];
                    roomObject.floor_type = room[7];
                    roomObject.floor_level = room[8];
                    roomObject.location = room[9];
                }

                if (roomObject.location == 'Kalmar' || roomObject.location == 'Nyckel') { roomObject.location = 'Kalmar Nyckel'; }
                if (roomObject.location == 'Universitetsbiblioteket,') { roomObject.location = 'Universitetsbiblioteket' }
                
                rooms.push(roomObject);
            }
        } catch (error) {
            console.log(error)
            console.log('oops')
        }
    }

    browser.close();

    return rooms;
};
