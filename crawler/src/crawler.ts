import axios from 'axios';
import cheerio from 'cheerio';
import * as url from 'url';
import {Client} from '@elastic/elasticsearch';

const elastic = new Client({ node: 'http://localhost:9200' });

const startUrl = 'https://denmchenry.com/';
const visited: Set<string> = new Set();
const urlQueue: Set<string> = new Set();
const indexed: Set<string> = new Set();

async function crawl(pageUrl: string): Promise<void> {
  if (visited.has(pageUrl)) return;
  visited.add(pageUrl);

  try {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);

    console.log(`Crawling: ${pageUrl}`);
    $('a').each((i, link) => {
      const href = $(link).attr('href');
      if (href) {
        const absoluteUrl = url.resolve(pageUrl, href);
        if (absoluteUrl.startsWith('http')) {
          urlQueue.add(absoluteUrl);
        }
      }
    });
  } catch (error) {
    console.error(`Error crawling ${pageUrl}: ${(error as Error).message}`);
  } finally {
		indexed.add(pageUrl);
	}
}

function crawlNext(): void {
	crawl(urlQueue.values().next().value);
	urlQueue.delete(urlQueue.values().next().value);
}

async function indexToElastic(): Promise<void> {
	let indexedBuffer = new Set([...indexed]);
	indexed.clear();

	indexedBuffer.forEach(async (url) => {
		await elastic.index({
			index: 'urls',
			document: {
				id: url
			}
		});
	});
}

crawl(startUrl);

setInterval(() => crawlNext(), 500);
setInterval(() => indexToElastic(), 5*1000);
setInterval(async () => await elastic.indices.refresh({ index: 'urls' }), 60*1000);
