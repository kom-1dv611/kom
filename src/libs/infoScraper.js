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
        document.querySelector('#ffsearchname').value = 'ny215k'

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

    let result = await page.evaluate(() => {
        // skriver ut info som finns i pop-up ruta
        // TODO: kunna klicka på lokal, men länk-url är fel...
        let iframe = document.getElementById('fancybox-frame')
        let iframeDoc = iframe.contentDocument || ifram.contentWindow.document
        let iframeP = iframeDoc.querySelector('.infoboxtd')

        return iframeP.innerHTML
    })

    await page.waitFor(2000)

    browser.close()
    return result
}

module.exports = scrape