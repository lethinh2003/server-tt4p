const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const sendEmail = async (options) => {
  // const transporter = nodemailer.createTransport({
  //     service: "Gmail",
  //     auth: {
  //         user: process.env.EMAIL_USERNAME,
  //         pass: process.env.EMAIL_PASSWORD,
  //     }
  // })
  // Gmail only//

  //mailtrap//
  // const transport = nodemailer.createTransport({
  //   host: "smtp.mailtrap.io",
  //   port: 2525,
  //   secure: false,
  //   auth: {
  //     user: "432135c49509cc",
  //     pass: "0d817140417654",
  //   },
  // });

  //SENDGRID
  const transport = nodemailer.createTransport(
    sgTransport({
      auth: {
        api_key: process.env.SENDGRID_APIKEY,
      },
    })
  );
  const mailOptions = {
    from: process.env.SENDGRID_MAILFROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transport.sendMail(mailOptions);
};
module.exports = sendEmail;
