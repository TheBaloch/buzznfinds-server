import axios from "axios";

import * as dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_NUMBER_ID;

export const whatsappCVForm = (
  to: string,
  lang: string,
  name: string,
  ssid: string
) => {
  try {
    axios.post(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: "cvform",
          language: {
            code: lang,
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: name,
                },
                {
                  type: "text",
                  text: `https://imguru.ae/link/job-cv-form/${ssid}`,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: ssid,
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    console.log("Whatsapp CV Form error:", e);
  }
};
