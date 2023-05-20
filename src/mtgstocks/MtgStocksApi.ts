import axios,
{
  AxiosInstance,
  AxiosResponse,
} from 'axios';
import { MtgStocksSearchResult } from './model/MtgStocksSearchResult';
import { MtgStocksPrint } from './model/MtgStocksPrint';

export class MtgStocksApi {
  constructor(private axiosInstance: AxiosInstance) {}

  public async search(name: string): Promise<MtgStocksSearchResult[] | undefined> {
    const sanitizedName = name.split('//')[0].trim();
    const query = encodeURI(sanitizedName);
    const url = `/search/autocomplete/${query}`;

    try {
      const { data }: AxiosResponse<MtgStocksSearchResult[]> = await this.axiosInstance.get(
        url,
        {
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
          },
        },
      );

      return data.filter((result) => result.name === sanitizedName);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        // eslint-disable-next-line no-console
        console.error(`MtgStocksApi.search error ${e.code} for ${url}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`MtgStocksApi.search error finding ${url}`);
      }
    }

    return undefined;
  }

  public async getPrintById(mtgStocksId: number): Promise<MtgStocksPrint | undefined> {
    const url = `/prints/${mtgStocksId}`;

    try {
      const { data }: AxiosResponse<MtgStocksPrint> = await this.axiosInstance.get(
        url,
        {
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
          },
        },
      );

      return data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        // eslint-disable-next-line no-console
        console.error(`MtgStocksApi.getPrintById error ${e.code} for ${url}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`MtgStocksApi.getPrintById error finding ${url}`);
      }
    }

    return undefined;
  }

  public async getPrint(name: string, multiverseId: number): Promise<MtgStocksPrint | undefined> {
    const mtgStocksCards = await this.search(name);

    if (mtgStocksCards) {
      if (mtgStocksCards.length !== 1) {
        // eslint-disable-next-line no-console
        console.error(`found ${mtgStocksCards.length} results for ${name}`);
        return undefined;
      }

      const mtgStocksCard = mtgStocksCards[0];
      let print = await this.getPrintById(mtgStocksCard.id);

      if (print && print.multiverse_id !== multiverseId) {
        print = await Promise.any(
          print.sets.map(async (set): Promise<MtgStocksPrint | never> => {
            const p = await this.getPrintById(set.id);

            return new Promise((resolve, reject) => {
              if (p && p.multiverse_id === multiverseId) {
                resolve(p);
              } else {
                reject();
              }
            });
          }),
        );
      }

      return print;
    }

    return undefined;
  }
}
