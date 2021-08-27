import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperFunctions {
  convertLocaleStringToDate(dateTimeString: string): Date {
    const dt = dateTimeString.split(' ');
    const dtString = dt[0]
      .split('/')
      .reverse()
      .join('-')
      .concat(' ' + dt[1]);

    return new Date(dtString);
  }
}
