import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserWelcome() {
    const user = {
      name: 'Hari Malam',
      email: 'malamharid@gmail.com',
    };
    const token = 'token';
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './welcome',
      context: {
        name: user.name,
        url,
      },
    });
  }
}
