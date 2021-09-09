import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone'
})
export class PhonePipe implements PipeTransform {

  // transform(value: any, args?: any): any {
  //   return null;
  // }

  transform(contact: any): any {
    var country, city, number;
    
    if(!contact)
      return "";

    var value = contact.toString().trim().replace(/^\+/, '');

    if (!value) 
      return "";

    if (value.length == 10) {
      // +1PPP####### -> C (PPP) ###-####
      country = 1;
      city = value.slice(0, 3);
      number = value.slice(3);
    }

    if (country == 1) {
      country = "";
    }

    number = number.slice(0, 3) + '-' + number.slice(3);
    return (country + " (" + city + ") " + number).trim();
  }

}
