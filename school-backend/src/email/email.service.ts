import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;
  private fromAddress!: string;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('SMTP_HOST');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT') ?? '587'),
        secure: this.config.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
      this.fromAddress = this.config.get<string>('SMTP_FROM') ?? 'no-reply@school.local';
      this.logger.log(`Email transport configured for ${host}`);
      return;
    }

    // No SMTP configured — spin up a free Ethereal test inbox so
    // password-reset/verification emails still work end-to-end in
    // development without any setup. Nothing sent this way reaches a
    // real inbox; every send() logs a preview URL to the console.
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    this.fromAddress = testAccount.user;
    this.logger.warn(
      'No SMTP_HOST configured — using a temporary Ethereal test inbox. ' +
        'Emails will NOT reach real recipients; check server logs for preview links.',
    );
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({ from: this.fromAddress, to, subject, html });
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        this.logger.log(`Email preview (${subject} -> ${to}): ${preview}`);
      } else {
        this.logger.log(`Email sent (${subject} -> ${to}), messageId: ${info.messageId}`);
      }
    } catch (err) {
      // Same philosophy as AuditService: a failed email send shouldn't
      // crash the mutation that triggered it — the token still exists
      // in the database and the person can request another one.
      this.logger.error(`Failed to send email to ${to}: ${err}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.send(
      to,
      'Reset your DreamEdu password',
      `<p>Someone requested a password reset for this account.</p>
       <p><a href="${resetUrl}">Click here to reset your password</a> — this link expires in 1 hour.</p>
       <p>If you didn't request this, you can safely ignore this email — your password hasn't been changed.</p>`,
    );
  }

  async sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
    await this.send(
      to,
      'Verify your DreamEdu email',
      `<p>Welcome! Please verify your email address to activate your account.</p>
       <p><a href="${verifyUrl}">Click here to verify your email</a> — this link expires in 24 hours.</p>`,
    );
  }
}