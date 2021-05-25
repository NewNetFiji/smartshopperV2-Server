"use strict";
import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, subject: string, html: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount();
//   console.log("testAccount: ", testAccount)

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "kdt3qvqwytu6u2eh@ethereal.email", // generated ethereal user
      pass: "ppVzk1GXjjvH7XmQnS", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Smart Shopper Fj 👻" <smartshopperFj@newnet.com.fj>', // sender address
    to, // list of receivers
    subject, // Subject line
    html, // plain text body
  });

  console.log("Message sent: %s", info.messageId);  

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


