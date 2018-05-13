const Moderation = require('../../structures/Moderation.js');

class Warn extends Moderation {
  constructor(client) {
    super(client, {
      name: 'warn',
      description: 'Warns a mentioned user.',
      usage: 'warn <member:user> <reason:string>',
      extended: 'This warns the mentioned user, with a reason.',
      category: 'Moderation',      
      aliases: ['caution'],
      botPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
      permLevel: 'Moderator'
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const settings = this.client.settings.get(message.guild.id);
    
    const channel  = message.guild.channels.exists('name', settings.modLogChannel);
    if (!channel)    return message.error(message, `I cannot find the \`${settings.modLogChannel}\` channel. Try running \`${settings.prefix}set edit modLogChannel logs\`.`);
    const target   = await this.verifyMember(message.guild, args[0]);
    if (!target)     return message.error(message, 'Invalid command usage, you must mention someone to use this command.');
    const modLevel = this.modCheck(message, args[0], level);
    if (typeof modLevel === 'string') return message.reply(modLevel);
    const reason   = args.splice(1, args.length).join(' ');
    if (!reason)     return message.error(message, 'Invalid command usage, you must supply a reason to use this command.');
    try {
      // await this.infractionCreate(this.client, message.guild, 'Warn', target, message.author, reason);
      await this.buildModLog(this.client, message.guild, 'w', target, message.author, reason);
      await message.channel.send(`\`${target.user.tag}\` was successfully warned.`);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Warn;