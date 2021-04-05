import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortTable'
})
export class SortTablePipe implements PipeTransform {

  transform(array: Array<any>): any {
    array.sort((a: any, b: any) => {
      console.log(a.Compatibility[0]);
      if (a.Compatibility[0] < b.Compatibility[0]) {
        return -1;
      } else if (a.Compatibility[0] > b.Compatibility[0]) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }

}
