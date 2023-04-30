import axios,
{
  AxiosInstance,
  AxiosResponse,
} from 'axios';
import { GathererSearchResponse } from './model/GathererSearchResponse';
import { GathererCard } from './model/GathererCard';

export class GathererApi {
  constructor(private axiosInstance: AxiosInstance) {}

  public async search(name: string): Promise<GathererCard[] | undefined> {
    const query = encodeURI(name.toLowerCase());
    const url = `/Handlers/InlineCardSearch.ashx?nameFragment=${query}`;

    try {
      const { data }: AxiosResponse<GathererSearchResponse> = await this.axiosInstance.get(
        url,
        {
          headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
          },
        },
      );

      return data.Results.filter((result) => result.Name === name);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        // eslint-disable-next-line no-console
        console.error(`GathererApi.search error ${e.code} for ${url}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`GathererApi.search error finding ${url}`);
      }
    }

    return undefined;
  }
}
