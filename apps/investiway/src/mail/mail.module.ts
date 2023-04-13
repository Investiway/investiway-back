import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { MailConfig } from '../configs/mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useClass: MailConfig,
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
