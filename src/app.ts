import { LocalCache } from './localcache/LocalCache';
import { MoxfieldApi } from './moxfield/MoxfieldApi';
import { CacheCard } from './localcache/model/CacheCard';
import { MtgStocksApi } from './mtgstocks/MtgStocksApi';
import { ScryfallApi } from './scryfall/ScryfallApi';
import { MtgStocksPrint } from './mtgstocks/model/MtgStocksPrint';
import { createAxiosInstance } from './httpModule';

const moxfield_filepath = 'moxfield_haves_2023-04-26-1538Z.csv';
const cache_filename = 'cache.json';

async function main(): Promise<void> {
  const filterMinCount = 1;
  const filterNotReserved = true;
  const filterIncreasedBy = 1.1;
  const filterMinPrice = 5;

  const cache = new LocalCache(cache_filename);
  const moxfield = new MoxfieldApi(moxfield_filepath);
  const collection = await moxfield.cards();
  const mtgStocks = new MtgStocksApi(createAxiosInstance('https://api.mtgstocks.com'));
  const scryfall = new ScryfallApi(createAxiosInstance('https://api.scryfall.com'));

  try {
    await Promise.all(
      collection.map(async (cardCollection) => {
        const { count, card } = cardCollection;
        const { name, edition, collectorNumber } = card;

        if (count > filterMinCount) {
          const cacheCard: CacheCard | undefined = await cache.search(edition, collectorNumber);
          let print: MtgStocksPrint | undefined;

          if (cacheCard) {
            print = await mtgStocks.getPrintById(cacheCard.mtgStocksId);

            if (print && print.name !== name) {
              // eslint-disable-next-line no-console
              console.warn(`Print for ${name} found to be ${print.name}`);
              print = undefined;
            }
          } else {
            const scryfallCard = await scryfall.getCard(edition, collectorNumber);
            const usd: number = Number(scryfallCard?.prices.usd ?? '0.0');
            const multiverseId: number | undefined = scryfallCard?.multiverse_ids[0];

            if (multiverseId && usd >= filterMinPrice) {
              print = await mtgStocks.getPrint(name, multiverseId);

              if (print) {
                await cache.cache(
                  name,
                  multiverseId,
                  edition,
                  collectorNumber,
                  print.id,
                );
              }
            }
          }

          if (print) {
            if (
              (!filterNotReserved || !print.card.reserved)
              && print.latest_price.market >= filterMinPrice
              && print.latest_price.market > (print.all_time_low.avg * filterIncreasedBy)
            ) {
              // eslint-disable-next-line no-console
              console.log(`"${name}","${count}","${print.all_time_low.avg}","${print.latest_price.market}"`);
            }
          }
        }
      }),
    );
  } catch (e) {
    // noop
  }

  await cache.save();
}

main();
