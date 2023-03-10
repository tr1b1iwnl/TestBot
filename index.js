const {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const { imageAI, imageAIVariation } = require("./src/imageAI");
const commands = require("./src/commands");
const chatAI = require("./src/chatAI");
const detectAI = require("./src/detectorAI");
const checkPlagiarism = require("./src/plagiarismChecker");
const { rephrase, simplify } = require("./src/rephraser");
require("dotenv").config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

// Deploy the commands
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_APPLICATION_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Connect to the Discord API using your bot token
client.login(process.env.DISCORD_BOT_TOKEN);

// Wait for the bot to be ready
client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (interaction.channel.name === "image-ai") {
    if (interaction.commandName === "changpt-image") {
      await imageAI(client.user, interaction, openai);
    } else if (interaction.commandName === "changpt-image-variation") {
      await imageAIVariation(client.user, interaction, openai);
    }
  } else if (interaction.channel.name === "chatgpt") {
    if (interaction.commandName === "changpt-ask") {
      await chatAI(client.user, interaction, openai);
    } else if (interaction.customId === "reg_response") {
      await chatAI(
        client.user,
        interaction,
        openai,
        interaction.message.embeds[0].data.title
      );
    }
  } else if (interaction.channel.name === "ai-detection") {
    if (interaction.commandName === "detect") {
      await detectAI(client.user, interaction);
    }
  } else if (interaction.channel.name === "plagiarism-checker") {
    if (interaction.commandName === "check-plagiarism") {
      await checkPlagiarism(client.user, interaction);
    }
  } else if (interaction.channel.name === "writing-tools") {
    if (interaction.commandName === "rephrase") {
      await rephrase(client.user, interaction);
    }
    if (interaction.commandName === "simplify") {
      await simplify(client.user, interaction);
    }
  }
});
