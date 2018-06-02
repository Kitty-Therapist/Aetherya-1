// Require the base command class.
const Command = require('./Command.js');

// Create the class so we can use it in commands.
class Twitch extends Command {
  constructor(client, options) {
    super(client, Object.assign(options, {
      category: 'Twitch',
      guildOnly: true,
      permLevel: 'Family'
    }));
  }

  // The function to announce a stream. Utilizes this.createEmbed.
  async streamEmbed(client, message, title, streamURL, description) {
    const embed = await this.createEmbed(client, message, title, description, streamURL);
    const { streamChannel, prefix } = this.client.settings.get(message.guild.id);
    const channel = message.guild.channels.find('name', streamChannel);
    if (!channel) return message.reply(`|\`❌\`| I cannot find the ${streamChannel} channel. Try running \`${prefix}set edit streamChannel announcements\``);
    if (channel) {
      channel.send({ embed });
    }
  }

  // Actually create the embed, and get information about the stream.
  async createEmbed(client, message, title, streamURL, description) {
    const { 
      RichEmbed 
    } = require('discord.js');
    const Twitch = new (require('twitch.tv-api'))({id: process.env.TWITCHID, secret: process.env.TWITCHSECRET});
    const stream = streamURL.slice(22);
    const data = await Twitch.getUser(stream);
    const embed = new RichEmbed()
      .setTimestamp()
      .setAuthor(data.stream.channel.display_name, data.stream.channel.logo, streamURL)
      .setTitle(title)
      .setURL(streamURL)
      .setDescription(description)
      .setThumbnail(data.stream.channel.logo)
      .setImage(data.stream.preview.large);
    return embed;
  }
}

// Export the class so we can use it in commands.
module.exports = Twitch;