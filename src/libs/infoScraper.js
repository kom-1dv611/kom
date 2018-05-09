let puppeteer = require('puppeteer')
let Room = require('../models/Room.js')

let scrape = async () => {
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
        document.querySelector('#ffsearchname').value = 'ny212k'

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
        // url till info sidan
        let iframeA = iframeP.querySelector('a').href

        return iframeA
    })

    await page.waitFor(1000)

    // gå till info sidan
    await page.goto(newUrl)

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
        // hur ska vi hämta ut utrustning om det finns mer än en sak? Hamnar på olika index.
        // om det inte finns någon information om rummet kommer de finnas annan info på dessa index
        // TODO: först kolla om det finns ett index som innehåller "Utrustning"?
        context.equipment = {first: list[19], second: list[20] }
        roomInfo.push(context)
    }

    // TODO: gå igenom alla rum som finns i databasen och spara info till de rummen.
    // TODO: spara information om rummen.

    // OBS! Vad händer om man tar bort alla waitFor? Kanske måste ha dem, kan vi köra skrapan ändå?
    // När man gör en sökning och väljer "Lokal", väljs inte alltid lokal. Vad gör vi åt detta?

    await page.waitFor(2000)

    browser.close()
    // använd list för att se vilket index
    return roomInfo
}

module.exports = scrape