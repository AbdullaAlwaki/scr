const ex = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const app = ex();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  fs.readFileSync("../frontend/index.html", function read(err, data) {
    if (err) {
      res.send(err);
    }
    const content = data;
    res.send(content);
  });

  let browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  let page = await browser.newPage();
  await page.goto("https://n.lodynet.ink/");
  await page.evaluate(() => {
    let input = document.querySelector("#SearchAdvanced");
    let btnS = document.querySelector("button");
    input.value = "pk";

    btnS.click();
  });
  await page.waitForNavigation();
  const a = await page.$$eval("a", (a) => {
    return a.filter((a) => a.href.includes("85-pk")).map((a) => a.href);
  });
  await page.goto(a[0]);
  await page.waitForSelector(".ServersList li");
  const servers = await page.$$eval(".ServersList li", (li) => {
    return li.map((li) => li.dataset.embed);
  });
  fs.appendFile("links.json", JSON.stringify(servers), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });

  await browser.close();
});

app.listen(port, () => {
  console.log("Server is running on port http//:localhost:" + port);
});
