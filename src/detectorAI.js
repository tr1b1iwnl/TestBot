const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
const { arrayToDescription } = require("./utils");

const detectAI = async (user, interaction) => {
  try {
    const input = interaction.options.getString("text");
    interaction.deferReply({ ephemeral: false });
    const response = await axios.post(
      process.env.AI_DETECTOR_URL,
      {
        text: input,
      },
      {
        headers: {
          Referer: process.env.AI_DETECTOR_URL_REF,
          Cookie: `session=${process.env.AI_DETECTOR_COOKIE}`,
        },
      }
    );

    const { score: probability, sentence_scores } = response.data;
    const isHuman = probability < 0.5 ? true : false;

    const embeddedMessage = new EmbedBuilder()
      .setTitle(
        `${
          isHuman ? "Human" : "AI"
        } Generated Content, with a probability of ${(
          probability * 100
        ).toFixed(2)}%`
      )
      .setAuthor({
        name: user.username,
        iconURL: user.defaultAvatarURL,
      })
      .setColor("DarkOrange")
      .setDescription(arrayToDescription(sentence_scores));

    interaction.editReply({
      embeds: [embeddedMessage],
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response);
    } else {
      console.log(error.message);
    }
  }
};

module.exports = detectAI;
