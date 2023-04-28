// 
// const puppeteer  = require("puppeteer");
const express = require('express');
const { Parser } = require('json2csv');
const app = express();

const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const autoScroll = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve, _) => {
        let totalHeight = 0;
        const distance = 200;
        const timer = setInterval(async () => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
  
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 400);
      });
    });
   

  };


// 

// Define a route to retrieve the list of items
app.get('/get', async (req, res) => {
    const {link} = req.query;
    console.log(link)
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });
    try{
        puppeteer.use(stealthPlugin());
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
   
  
    // Open a new page
    const page = await browser.newPage();
    await page.goto(link);
    await autoScroll(page);
    await page.evaluate(()=>{
        const buttons = document.querySelectorAll('.button_flare');
        for (var i = 0; i < buttons.length; ++i) {
            buttons[i].click();
          }
    })
    await autoScroll(page);

    const Data2 = await page.evaluate(() => {

        const names = document.querySelectorAll(".resultbox_title_anchor");
        const numbers = document.querySelectorAll(".callcontent");

    
        return {names: Array.from(names).map(x=>x.title) ,
                    numbers : Array.from(numbers).map(x=>x.innerText) };
      });
 
    var result=[];
    Data2.names.forEach((element,index) => {
        result.push({
            name:element,
            number:Data2.numbers[index]
        })
    });
    return res.send(result)
//   const csv = json2csv.parse(data);
//   res.header('Content-Type', 'text/csv');
//   res.attachment(fileName);
//   return res.send(csv);
//     await browser.close();
//     return res.sendFile(path)
}catch (err){
    await browser.close();
    res.send(err)
}
});

// Start the server
const port = 5500;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

