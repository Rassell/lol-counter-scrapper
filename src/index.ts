require('dotenv').config();
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { getCollection } from './DatabaseClient';
import { getChampions, getLatestVersion } from './DragonApiClient';
import { getChampionData } from './CommunityDragonClient';

async function main() {
  console.log('Starting...');
  console.log('Getting latest version...');

  // Get the latest version from the Dragon API
  const latestVersion = await getLatestVersion();
  console.log('latest version: ', latestVersion);

  // Get the list of champions from the Dragon API
  const championsFromLoLAPI: any[] = await getChampions(latestVersion);

  // Return the list of promises
  const characterDataPromises = championsFromLoLAPI.map(async i => {
    try {
      // Get the champion data from the Community Dragon API
      const championData = await getChampionData(i.id);

      // Update the champion data with the data from the Community Dragon API
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

  // Wait for all promises to resolve
  const dataList = await Promise.allSettled(characterDataPromises);

  // Get only the successful promises
  const championsData: IChampionData[] = dataList
    .filter((data: any) => data.value && data.status === 'fulfilled')
    .map((data: any) => data.value);

  // Open the browser
  const browser = await puppeteer.launch({ slowMo: 500, headless: true });
  const page = await browser.newPage();

  // Get the counter data for each champion
  for (const championData of championsData) {
    console.log(`Getting counters for ${championData.name}`);

    await page.goto(
      `https://u.gg/lol/champions/${championData.name.toLowerCase()}/counter?rank=overall`,
    );
    await page.waitForSelector('#main-content');

    const html = await page.content();
    const $ = cheerio.load(html);

    const selectElem = $('.counter-list-card.best-win-rate').text();

    // Clear the data obtained from the page
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

    // Update the counter data from the page
    (await getCollection('counters')).updateOne(
      { id: championData.id },
      { $set: { counters } },
      { upsert: true },
    );

    console.log(`${championData.name} counters updated`);
  }

  await page.close();
  await browser.close();
}

main();
