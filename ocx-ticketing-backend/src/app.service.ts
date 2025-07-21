import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Anh em mình thế thôi hẹ hẹ hẹ!';
  }
}
