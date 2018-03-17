const Command = require('../../structures/Command.js');
const Stopwatch = require('../../util/Stopwatch.js');
const { inspect } = require('util');
const { post } = require('snekfetch');

class Eval extends Command {
  constructor(client) {
    super(client, {
      name: 'eval',
      description: 'Evaluates arbitrary Javascript.',
      category: 'System',
      usage: 'eval <expression:string>',
      extended: 'This is an extremely dangerous command, use with caution and never eval stuff strangers tell you.',
      aliases: ['ev'],
      permLevel: 'Bot Admin'
    });
  }

  async run(message, args, level) {
    const stopwatch = new Stopwatch();
    let syncTime, asyncTime;
    const { client } = message;
    const code = args.join(' ');
    const token = client.token.split('').join('[^]{0,2}');
    const rev = client.token.split('').reverse().join('[^]{0,2}');
    const filter = new RegExp(`${token}|${rev}`, 'g');
    try {
      let output = eval(code);
      syncTime = stopwatch.friendlyDuration;
      if (output instanceof Promise || (Boolean(output) && typeof output.then === 'function' && typeof output.catch === 'function')) {
        stopwatch.restart();
        output = await output;
        asyncTime = stopwatch.friendlyDuration;
      }
      const type = this.getType(output);
      output = inspect(output, { depth: 0, maxArrayLength: null });
      output = output.replace(filter, '[TOKEN]');
      output = this.clean(output);
      if (output.length < 1950) {
        stopwatch.stop();
        const time = this.formatTime(syncTime, asyncTime);
        message.channel.send(`**Output:**\n\`\`\`js\n${output}\`\`\`\n**Type:**\`\`\`${type.toLowerCase()}\`\`\`\n${time}`);
      } else {
        try {
          const { body } = await post('https://www.hastebin.com/documents').send(output);
          message.channel.send(`Output was to long so it was uploaded to hastebin https://www.hastebin.com/${body.key}.js `);
        } catch (error) {
          message.channel.send(`I tried to upload the output to hastebin but encountered this error ${error.name}:${error.message}`);
        }
      }
    } catch (error) {
      message.channel.send(`The following error occured \`\`\`js\n${error.stack}\`\`\``);
    }
  }

  formatTime(syncTime, asyncTime) {
    return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
  }

  clean(text)  {
    return text
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, '@' + String.fromCharCode(8203));
  }

  getType(input) {
    switch (typeof input) {
      case 'object': return input === null ? 'null' : input.constructor ? input.constructor.name : 'Object';
      case 'function': return input.constructor.name;
      case 'undefined': return 'undefined';
      default: return typeof input;
    }
  }
}

module.exports = Eval;