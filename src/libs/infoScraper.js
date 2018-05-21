let puppeteer = require('puppeteer')
let RoomHandler = require('../routes/handlers/RoomHandler');

let scrape = async (RoomModel) => {
    let Room = new RoomHandler(RoomModel);
    let rooms = await Room.getRoomsFromDB();

    for (let i = 0; i < rooms.length; i++) {
        console.log(rooms[i].name)
    }
    // TODO: sök efter alla lokalnamn i databasen
    let browser = await puppeteer.launch({ headless: false })
    let page = await browser.newPage()
    let url = 'https://se.timeedit.net/web/lnu/db1/schema1'
    await page.goto(url)

    // Gå till: Schema och visning av bokningar...
    await page.click('#contents > div.linklist > div > div:nth-child(1) > a:nth-child(1)')

    await page.waitFor(2000)

    // Ändra till Lokal sökning
    await page.select('#fancytypeselector', '4')

    await page.waitFor(2000)

    await page.evaluate(() => {
        // Sätter värdet ny212k
        document.querySelector('#ffsearchname').value = 'ny256k'

        // Klicka på SÖK knappen
        document.querySelector('.ffsearchbutton.objectsearchbutton').click()
    })

    await page.waitFor(1000)

    await page.evaluate(() => {
        // Välj sökresultat
        document.querySelector('#objectbasketitemX0').click()

        // Klicka på Visa Schema
        document.querySelector('#objectbasketgo').click()
    })

    await page.waitFor(1000)

    await page.evaluate(() => {
        // klicka upp info fönster
        document.querySelector('.column0.columnLine.nw.c0.la1').click()
    })

    await page.waitFor(1000)

    let newUrl = await page.evaluate(() => {
        // skriver ut info som finns i första pop-up ruta
        let iframe = document.getElementById('fancybox-frame')
        let iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        let iframeP = iframeDoc.querySelector('.infoboxtd')

        let elements = Array.from(iframeP.querySelectorAll('a'))
        let links = elements.map(element => {
            // TODO: kolla mot lokalnamn i databasen
            if (element.textContent == 'Ny256K') {
                return element.href
            }
        })
        return links
    })

    for (let i = 0; i < newUrl.length; i++) {
        if (newUrl[i] !== null) {
            // gå till info sidan
            await page.goto(newUrl[i])
        }
    }

    await page.waitFor(1000)

    let table = await page.evaluate(() => {
        let lists = document.querySelector('.objectfieldsextra')
        let roomList = []

        for (let i = 0; i < lists.childElementCount; i++) {
            roomList.push(lists.children[i].textContent)
        }

        return roomList
    })

    let roomInfo = []
    let list

    for (let i = 0; i < table.length; i++) {
        list = table[i].replace(/\s+/g, ' ')
        list = list.split(' ');

        let context = {}

        context.name = list[4]
        context.size = list[15]
        // spara endast ner om det finns dator eller inte.
        if (list[18] === 'Utrustning') {
            // det finns utrustning
            if (list[19] === 'Dator') {
                // dator finns
                context.equipment = list[19]
            }
        } else {
            // det finns ingen utrustning listad
            context.equipment = {}
        }
        roomInfo.push(context)
    }

    // TODO: spara information om rummen.

    await page.waitFor(2000)

    browser.close()
    // använd list för att se vilket index
    return roomInfo
}

module.exports = scrape