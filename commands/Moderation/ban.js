const Moderation = require('../../structures/Moderation.js');

class Ban extends Moderation {
  constructor(client) {
    super(client, {
      name: 'ban',
      description: 'Bans a mentioned user.',
      usage: 'ban <member:user> [reason:string]',
      extended: 'This bans the mentioned user, with or without a reason.',
      category: 'Moderation',
      aliases: ['B&', 'b&', 'bean', 'bent'],
      botPerms: ['SEND_MESSAGES', 'BAN_MEMBERS', 'EMBED_LINKS'],
      permLevel: 'Moderator'
    });
  }

  async run(message, args, level) {
    const settings = this.client.settings.get(message.guild.id);

    const channel  = message.guild.channels.exists('name', settings.modLogChannel);
    if (!channel)    return message.error(message, `I cannot find the \`${settings.modLogChannel}\` channel. Try running \`${settings.prefix}set edit modLogChannel logs\`.`);
    const target   = await this.verifyMember(message.guild, args[0]);
    if (!target)     return message.error(message, 'Invalid command usage, you must mention someone to use this command.');
    const modLevel = this.modCheck(message, args[0], level);
    if (typeof modLevel === 'string') return message.reply(modLevel);
    const reason   = args.splice(1, args.length).join(' ');
    try {
      await target.ban({ days: 0, reason: reason.length < 1 ? 'No reason supplied.' : reason });
      await this.buildModLog(this.client, message.guild, 'b', target, message.author, reason);
      await message.channel.send(`\`${target.user.tag}\` was successfully banned.`);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Ban;