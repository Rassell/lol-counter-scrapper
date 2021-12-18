require('dotenv').config();
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { getCollection } from './DatabaseClient';
import { getChampions, getLatestVersion } from './DragonApiClient';
import { getChampionData } from './CommunityDragonClient';

async function main() {
  console.log('Starting...');
  console.log('Getting latest version...');

  const latestVersion = await getLatestVersion();
  console.log('latest version: ', latestVersion);

  const championsFromLoLAPI: any[] = await getChampions(latestVersion);

  const characterDataPromises = championsFromLoLAPI.map(async i => {
    try {
      const championData = await getChampionData(i.id);

      (await getCollection('champions')).updateOne(
        { id: i.id },
        { $set: championData },
        { upsert: true },
      );

      console.log(`Updated ${i.name} with id ${i.key}`);

      return championData;
    } catch (error) {}
  });

  console.log(`Total champions ${characterDataPromises.length}`);

  Promise.allSettled(characterDataPromises).then(async dataList => {
    const championsData: IChampionData[] = dataList
      .filter((data: any) => data.value && data.status === 'fulfilled')
      .map((data: any) => data.value);

    const browser = await puppeteer.launch({ slowMo: 1000, headless: true });
    const page = await browser.newPage();

    for (const championData of championsData) {
      console.log(`Getting counters for ${championData.name}`);

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
              championsData.find(
                c => c.name.toLowerCase() === name.toLowerCase(),
              )?.id || -1,
            name,
            matches: parseInt(matches.replace(',', '')),
            winRate: parseFloat(winRate),
          };
        })
        .sort((a, b) => b.winRate - a.winRate);

      (await getCollection('counters')).updateOne(
        { id: championData.id },
        { $set: { counters } },
        { upsert: true },
      );

      console.log(`${championData.name} counters updated`);
    }

    await page.close();
    await browser.close();
  });
}

main();
