import axios,
{
  AxiosInstance,
  AxiosResponse,
} from 'axios';
import { ScryfallCard } from './model/ScryfallCard';

export class ScryfallApi {
  constructor(private axiosInstance: AxiosInstance) {}

  public async getCard(set: string, collectorNumber: number): Promise<ScryfallCard | undefined> {
    const url = `/cards/${set.toLowerCase()}/${collectorNumber}`;

    try {
      const { data }: AxiosResponse<ScryfallCard> = await this.axiosInstance.get(
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
        console.error(`ScryfallApi.getCard error ${e.code} for ${url}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`ScryfallApi.getCard error finding ${set} ${collectorNumber}`);
      }
    }

    return undefined;
  }
}
