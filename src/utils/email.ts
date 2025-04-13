import { htmlToText } from "html-to-text";
import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import pug from "pug";

// ========== Interfaces ==========
interface EmailSenderConfig {
  service?: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailContent {
  html: string;
  text: string;
  subject: string;
}

interface ContactDetails {
  email: string;
  name: string;
}
interface SendMailOptions {
  to: string;
  from: string;
  html: string;
  text: string;
  subject?: string;
  message?: string;
  url?: string;
}

interface SendEmailResult {
  success: boolean;
  statusCode: number;
  message: string;
  error?: Error;
}

// ========== Abstract Classes ==========
abstract class EmailSender {
  protected transporter: Transporter;
  protected templateDir: string;

  constructor(
    config: EmailSenderConfig,
    templateDir: string = path.join(process.cwd(), "src/views/email")
  ) {
    this.transporter = nodemailer.createTransport(config);
    this.templateDir = templateDir;
  }

  protected renderTemplate(templateName: string, data: object): string {
    return pug.renderFile(`${this.templateDir}/${templateName}.pug`, data);
  }

  protected async sendMail(options: SendMailOptions): Promise<SendEmailResult> {
    try {
      await this.transporter.sendMail(options);
      return {
        success: true,
        statusCode: 200,
        message: "Email sent successfully",
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to send email",
        error: error as Error,
      };
    }
  }

  abstract send(data: unknown): Promise<SendEmailResult>;
}

// ========== Concrete Implementations ==========
class ContactConfirmationEmail extends EmailSender {
  constructor(config: EmailSenderConfig) {
    super(config);
  }

  async send(params: {
    recipient: ContactDetails;
    sender: ContactDetails;
    message?: string;
    supportEmail?: string;
  }): Promise<SendEmailResult> {
    const content = this.prepareContent(params);
    const mailOptions: SendMailOptions = {
      from: this.formatAddress(params.sender),
      to: this.formatAddress(params.recipient),
      subject: content.subject,
      html: content.html,
      text: content.text,
    };

    return this.sendMail(mailOptions);
  }

  private prepareContent(params: {
    recipient: ContactDetails;
    sender: ContactDetails;
    message?: string;
    supportEmail?: string;
  }): EmailContent {
    const html = this.renderTemplate("confirm-contact-us", {
      contactName: this.getFirstName(params.recipient.name),
      contactEmail: params.recipient.email,
      supportEmail: params.supportEmail || params.sender.email,
      message: "Thank you for contacting us!",
    });

    return {
      html,
      text: htmlToText(html),
      subject: "Contact Request Confirmation",
    };
  }

  private getFirstName(fullName: string): string {
    return fullName.split(" ")[0];
  }

  private formatAddress(contact: ContactDetails): string {
    return `${contact.name} <${contact.email}>`;
  }
}
class ContactUsEmail extends EmailSender {
  constructor(config: EmailSenderConfig) {
    super(config);
  }

  async send(params: {
    recipient: ContactDetails;
    sender: ContactDetails;
    message: string;
    subject: string;
  }): Promise<SendEmailResult> {
    const content = this.prepareContent(params);
    const mailOptions: SendMailOptions = {
      from: this.formatAddress(params.sender),
      to: this.formatAddress(params.recipient),
      subject: content.subject,
      html: content.html,
      text: content.text,
    };

    return this.sendMail(mailOptions);
  }

  private prepareContent(params: {
    recipient: ContactDetails;
    sender: ContactDetails;
    message: string;
    subject: string;
  }): EmailContent {
    const html = this.renderTemplate("contact-us", {
      name: this.getFirstName(params.recipient.name),
      email: params.recipient.email,
      contactName: this.getFirstName(params.sender.name),
      contactEmail: params.sender.email,
      message: params.message,
      subject: params.subject,
    });

    return {
      html,
      text: htmlToText(html),
      subject: params.subject,
    };
  }

  private getFirstName(fullName: string): string {
    return fullName.split(" ")[0];
  }

  private formatAddress(contact: ContactDetails): string {
    return `${contact.name} <${contact.email}>`;
  }
}

export class EmailServiceFactory {
  static createSender<T extends EmailSender>(
    senderClass: new (config: EmailSenderConfig) => T
  ): T {
    const config = this.getTransportConfig();
    return new senderClass(config);
  }

  static createContactConfirmationSender(): ContactConfirmationEmail {
    return this.createSender(ContactConfirmationEmail);
  }
  static createContactUsSender(): ContactUsEmail {
    return this.createSender(ContactUsEmail);
  }

  private static getTransportConfig(): EmailSenderConfig {
    if (process.env.NODE_ENV === "production") {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        throw new Error("GMAIL USER && PASSWORD is not defined in production!");
      }
      return {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      };
    }
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
      throw new Error("GMAIL USER && PASSWORD is not defined in production!");
    }
    return {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
    };
  }
}
