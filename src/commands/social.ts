import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';

export async function handleDevCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('youtube')
      .setLabel('YouTube')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('discord_server')
      .setLabel('Servidor Discord')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('instagram')
      .setLabel('Instagram')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('github')
      .setLabel('Github')
      .setStyle(ButtonStyle.Secondary)
  );

  const response = await interaction.reply({
    content: 'Conheça mais sobre mim! Escolha uma das opções abaixo:',
    components: [row],
    fetchReply: true,
  });

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60_000, 
  });

  collector.on('collect', async (buttonInteraction) => {
    let message = '';

    switch (buttonInteraction.customId) {
      case 'youtube':
        message = 'Aqui está o link do meu canal no YouTube: [YouTube](https://www.youtube.com/@TinelliPlay)';
        break;
      case 'discord_server':
        message = 'Aqui está o link do servidor do Discord do canal: [Discord](https://discord.gg/5Fqj64HFDV)';
        break;
      case 'instagram':
        message = 'Aqui está o link do meu Instagram: [Instagram](https://www.instagram.com/vitortinelli)';
        break;
      case 'github':
        message = 'Aqui está o link do meu GitHub: [GitHub](https://github.com/vitortinelli)';
        break;
    }

    await buttonInteraction.reply({
      content: message,
      ephemeral: true,
    });
  });

  collector.on('end', async () => {
    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('youtube')
        .setLabel('YouTube')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('discord_server')
        .setLabel('Servidor Discord')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('instagram')
        .setLabel('Instagram')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('github')
        .setLabel('Github')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    await interaction.editReply({
      components: [disabledRow],
    }).catch(() => {});
  });
}
