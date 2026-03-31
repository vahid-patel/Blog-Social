import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('Brevo.BREVO_HOST'),
      port: parseInt(this.configService.get<string>('Brevo.BREVO_PORT')!),
      secure: false,
      auth: {
        user: this.configService.get<string>('Brevo.BREVO_USER'),
        pass: this.configService.get<string>('Brevo.BREVO_PASS'),
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
      } else {
        console.log('Server is ready to send messages');
      }
    });
  }

  async sendOtpToEmail(to: string, otp: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('Brevo.sender_email'),
        to,
        subject: 'Your Email Verification OTP Code',
        text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
      });
      console.log('Email sent:', info.messageId);
    } catch (err) {
      console.error('Email send failed:', err);
    }
  }
  async sendLinkToEmail(to: string, link: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('Brevo.sender_email'),
        to,
        subject: 'Your Forgot Password Verification Link',
        text: `Your Forgot Password link is ${link}. It expires in 15 minutes.`,
      });
      console.log('Email sent:', info.messageId);
    } catch (err) {
      console.error('Email send failed:', err);
    }
  }
}
