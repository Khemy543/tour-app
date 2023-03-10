const nodemailer = require('nodemailer');
const pug = require('pug');
// const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Gideon Assafuah <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid Transport
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject,
      }
    );

    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: 'hello',
    };

    await this.createTransport().sendMail(emailOptions);
  }
};
