const { EmbedBuilder } = require('discord.js');

module.exports = async (client, message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(';compile')) return;

  await message.react('⏳');
  const match = message.content.match(/```(\w+)\n([\s\S]*?)```/);

  if (!match) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Format error!')
      .setDescription(
        `Use ;compile command with code block under (language specified)`
      )
      .setColor(0xd21872)
      .setTimestamp();
    await message.reactions.removeAll();
    await message.react('❌');
    return message.reply({ embeds: [embed] });
  }

  const lang = match[1];
  const code = match[2].trim();

  try {
    const output = await runCode(lang, code);

    if (!output.trim()) {
      await message.reactions.removeAll();
      await message.react('⚠️');
      return message.reply('⚠️ No output returned.');
    }

    const safeOutput = output.slice(0, 1900);

    const embed = new EmbedBuilder()
      .setTitle('🧪 Output')
      .setDescription(`\`\`\`\n${safeOutput}\n\`\`\``)
      .setColor(0x18d272)
      .setFooter({ text: `${message.author.tag} | ${lang}` })
      .setTimestamp();
    await message.reactions.removeAll();
    await message.react('✅');
    return message.reply({ embeds: [embed] });
  } catch (err) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Error running code')
      .setDescription(`\`\`\`\n${err.message}\n\`\`\``)
      .setColor(0xd21872)
      .setTimestamp();
    await message.reactions.removeAll();
    await message.react('❌');
    return message.reply({ embeds: [embed] });
  }
};

async function runCode(lang, code) {
  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language: lang,
      version: '*',
      files: [{ content: code }],
    }),
  });

  const data = await res.json();

  return data.run.output || data.run.stderr || 'No output';
}
