/* eslint-disable class-methods-use-this */
import * as fs from 'fs';
import { parse } from 'csv-parse';
import { MoxfieldCard } from './model/MoxfieldCard';
import { MoxfieldCardCollection } from './model/MoxfieldCardCollection';
import { MoxfieldCollection } from './model/MoxfieldCollection';
import { MoxfieldHeader } from './model/MoxfieldHeader';

const data_foil = 'foil';

const header_count = 'Count';
const header_tradelist_count = 'Tradelist Count';
const header_name = 'Name';
const header_edition = 'Edition';
const header_condition = 'Condition';
const header_language = 'Language';
const header_foil = 'Foil';
const header_tags = 'Tags';
const header_last_modified = 'Last Modified';
const header_collector_number = 'Collector Number';
const header_alter = 'Alter';
const header_proxy = 'Proxy';
const header_purchase_price = 'Purchase Price';

const headers: MoxfieldHeader[] = [
  {
    name: header_count,
    position: 0,
  },
  {
    name: header_tradelist_count,
    position: 1,
  },
  {
    name: header_name,
    position: 2,
  },
  {
    name: header_edition,
    position: 3,
  },
  {
    name: header_condition,
    position: 4,
  },
  {
    name: header_language,
    position: 5,
  },
  {
    name: header_foil,
    position: 6,
  },
  {
    name: header_tags,
    position: 7,
  },
  {
    name: header_last_modified,
    position: 8,
  },
  {
    name: header_collector_number,
    position: 9,
  },
  {
    name: header_alter,
    position: 10,
  },
  {
    name: header_proxy,
    position: 11,
  },
  {
    name: header_purchase_price,
    position: 12,
  },
];

export class MoxfieldApi {
  constructor(private filepath: string) {}

  private positions: Record<string, number> = {};

  private collection: MoxfieldCollection | undefined;

  private cachePosition(name: string): number {
    const header: MoxfieldHeader = headers.find((h) => h.name === name) as MoxfieldHeader;
    const { position } = header;
    this.positions[header.name] = position;
    return position;
  }

  private getPosition(name: string): number {
    return this.positions[name] ?? this.cachePosition(name);
  }

  private sanitizeCollectorNumber(cn: string): number {
    let reduce = 0;
    const size = cn.length;
    let num;

    do {
      num = Number(cn.substring(0, size - reduce));
      reduce += 1;
    } while (Number.isNaN(num) && reduce <= size);

    return num;
  }

  private convertCard(row: string): MoxfieldCard {
    const cn = row[(this.getPosition(header_collector_number))];
    const collectorNumber = this.sanitizeCollectorNumber(cn);

    return {
      name: row[this.getPosition(header_name)],
      edition: row[this.getPosition(header_edition)],
      condition: row[this.getPosition(header_condition)],
      language: row[this.getPosition(header_language)],
      foil: row[this.getPosition(header_foil)] === data_foil,
      collectorNumber,
    };
  }

  private convertCollection(row: string): MoxfieldCardCollection {
    const card = this.convertCard(row);
    const count = Number(row[this.getPosition(header_count)]);

    return {
      count,
      card,
    };
  }

  private async loadCsv(): Promise<MoxfieldCollection> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filepath, 'utf8', (err, content) => {
        if (err) {
          if (err.errno === -2) {
            resolve({
              cards: [],
            });
          } else {
            reject(err);
          }
        } else {
          parse(
            content,
            {
              from_line: 2,
            },
            (e, rows: any[]) => {
              if (e) {
                reject(e);
              } else {
                resolve({
                  cards: rows.map((row) => this.convertCollection(row)),
                });
              }
            },
          );
        }
      });
    });
  }

  public async cards(): Promise<MoxfieldCardCollection[]> {
    if (!this.collection) {
      this.collection = await this.loadCsv();
    }

    return this.collection.cards;
  }
}
