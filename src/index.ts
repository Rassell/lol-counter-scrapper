require('dotenv').config();
import * as cheerio from 'cheerio';
import axiosDefault from 'axios';
import * as puppeteer from 'puppeteer';
import { MongoClient } from 'mongodb';
const axios = axiosDefault.create({ timeout: 5000 });

const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@cluster0.gws5w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any);

const characterPromises = Array.from(Array(9999).keys()).map(async i => {
  await client.connect();

  try {
    const response = await axios.get(
      `https://cdn.communitydragon.org/latest/champion/${i}/data`,
    );

    if (response.status > 200) return;

    const collection = client.db('lol-counter').collection('champions');

    await collection.updateOne(
      { id: i },
      { $set: response.data },
      { upsert: true },
    );

    return response.data;
  } catch (error) {}
});

Promise.allSettled(characterPromises).then(async dataList => {
  const championsData: IChampionData[] = dataList
    .filter((data: any) => data.value && data.status === 'fulfilled')
    .map((data: any) => data.value);

  const browser = await puppeteer.launch({ slowMo: 1000, headless: true });
  const page = await browser.newPage();

  for (const championData of championsData) {
    await page.goto(
      `https://u.gg/lol/champions/${championData.name.toLowerCase()}/counter?rank=overall`,
    );
    await page.waitForSelector('#main-content');

    const html = await page.content();
    const $ = cheerio.load(html);

    const selectElem = $('.counter-list-card.best-win-rate').text();

    const counters = selectElem
      .split(' games')
      .map(c => c.trim().replace('Matches', '').replace('WR', ''))
      .filter(c => c !== '')
      .map(c => {
        const [nameWinrate, matches] = c.split('% ');
        const name = /[a-z]+/i.exec(nameWinrate)[0];
        const winRate = /[0-9,]+/i.exec(nameWinrate)[0];
        return {
          id:
            championsData.find(c => c.name.toLowerCase() === name.toLowerCase())
              ?.id || -1,
          name,
          matches: parseInt(matches.replace(',', '')),
          winRate: parseFloat(winRate),
        };
      })
      .sort((a, b) => b.winRate - a.winRate);

    const collection = client.db('lol-counter').collection('counters');

    await collection.updateOne(
      { id: championData.id },
      { $set: { counters } },
      { upsert: true },
    );
  }

  client.close();

  await page.close();
  await browser.close();
});
