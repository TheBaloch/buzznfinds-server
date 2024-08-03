import transporter from "./transpoter";
import path from "path";
import fs from "fs";

export async function sendSucessEmailNotification(title: string, url: string) {
  try {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: process.env.MAIL_TO,
      subject: "Blog Generated",
      text: `Your blog with the title "${title}" has been generated successfully. You can view it at: ${url}`,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending  email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendFailEmailNotification(title: string) {
  try {
    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: process.env.MAIL_TO,
      subject: "Blog Failed",
      text: `Your blog with the title "${title}" Failed`,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending  email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendVerifyEmail(to: string, name: string, token: string) {
  try {
    const templatePath = path.join(__dirname, "templates/verifyEmail.html");
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");
    //@ts-ignore
    const content = emailTemplate.replaceAll(
      "{{verificationLink}}",
      `${process.env.CLIENT_URL}/verify-email/${token}`
    );

    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: to,
      subject: "Email Verification - Immigration Guru",
      text: `Hello ${name}!`,
      html: content,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendResetEmail(to: string, name: string, token: string) {
  try {
    const emailTemplate = fs.readFileSync(
      "templates/verifyEmail.html",
      "utf-8"
    );
    //@ts-ignore
    const content = emailTemplate.replaceAll(
      "{{verificationLink}}",
      `${process.env.CLIENT_URL}/verify-email/${token}`
    );

    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: to,
      subject: "Email Verification - Immigration Guru",
      text: `Hello ${name}!`,
      html: content,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPaymentLinkEmail(
  to: string,
  name: string,
  paymentLink: string
) {
  try {
    const templatePath = path.join(__dirname, "templates/paymentLink.html");
    const emailTemplate = fs.readFileSync(templatePath, "utf-8");
    //@ts-ignore
    const content = emailTemplate.replaceAll("{{paymentLink}}", paymentLink);

    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: to,
      subject: "Job Search - Immigration Guru",
      text: `Hello ${name}!`,
      html: content,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPaymentSucessEmail(to: string, name: string) {
  try {
    const templatePath = path.join(__dirname, "templates/paymentSucess.html");
    const content = fs.readFileSync(templatePath, "utf-8");

    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: to,
      subject: "Payment Sucess - Immigration Guru",
      text: `Hello ${name}!`,
      html: content,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPaymentFailEmail(to: string, name: string) {
  try {
    const templatePath = path.join(__dirname, "templates/paymentFail.html");
    const content = fs.readFileSync(templatePath, "utf-8");

    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: to,
      subject: "Payment Sucess - Immigration Guru",
      text: `Hello ${name}!`,
      html: content,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendAccountDetailsEmail(
  to: string,
  name: string,
  password: string,
  link: string
) {
  try {
    const templatePath = path.join(
      __dirname,
      "templates/sendAccountDetails.html"
    );
    const template = fs.readFileSync(templatePath, "utf-8");
    const content = template
      .replace("{{email}}", to)
      .replace("{{password}}", password)
      .replace("{{link}}", link)
      .replace("{{link}}", link)
      .replace("{{link}}", link);

    const mailOptions = {
      from: `"${process.env.MAIL_FROM}" <${process.env.MAIL_EMAIL}>`,
      to: to,
      subject: "Account Details - Immigration Guru",
      text: `Hello ${name}!`,
      html: content,
    };

    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) {
        console.error("Error sending verification email:", error);
      } else {
        //console.log("Verification email sent:", info.response);
      }
    });
  } catch (error) {
    console.error("Error reading email template:", error);
    throw new Error("Failed to send verification email");
  }
}
