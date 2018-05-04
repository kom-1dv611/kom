let puppeteer = require('puppeteer')

let scrape = async () => {
    let browser = await puppeteer.launch({ headless: false })
    let page = await browser.newPage()
    let url = 'https://se.timeedit.net/web/lnu/db1/schema1'
    await page.goto(url)
    
    // Gå till: Schema och visning av bokningar...
    await page.click('#contents > div.linklist > div > div:nth-child(1) > a:nth-child(1)')
    
    // Ändra till Lokal sökning
    await page.select('#fancytypeselector', '4')

    await page.waitFor(3000)

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

    let room = await page.evaluate(() => {
        // skriv ut lokalens namn
        return document.querySelector('.objectfieldsextra > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)').textContent
    })

    let size = await page.evaluate(() => {
        // skriv ut lokalens storlek
        return document.querySelector('.objectfieldsextra > tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(2)').textContent
    })

    let equipment = await page.evaluate(() => {
        // skriv ut lokalens utrustning
        return document.querySelector('.objectfieldsextra > tbody:nth-child(1) > tr:nth-child(9) > td:nth-child(2)').textContent
    })

    // TODO: hämta ut information på ett bättre sätt? Få med all utrustning som finns listad, inte bara första elementet.
    // TODO: spara information om rummen.
    // TODO: gå igenom alla rum som finns i databasen och spara info till de rummen.

    // OBS! Vad händer om man tar bort alla waitFor? Kanske måste ha dem, kan vi köra skrapan ändå?
    // När man gör en sökning och väljer "Lokal", väljs inte alltid lokal. Vad gör vi åt detta?

    await page.waitFor(2000)

    browser.close()
    return "Room: " + room + "\nSize: " + size + "\nEquipment: " + equipment
}

module.exports = scrape