import { Injectable } from '@nestjs/common';
import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailConfig implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      transport: {
        service: this.configService.get('IY_MAIL_SERVICE'),
        auth: {
          user: this.configService.get('IY_MAIL_USER'),
          pass: this.configService.get('IY_MAIL_PASS'),
        },
      },
    };
  }
}
