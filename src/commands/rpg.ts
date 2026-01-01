import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Colors,
} from 'discord.js';
import { supabase } from '../config/supabase';
import type { Story } from '../types';

export async function handleCreateStoryCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const userId = interaction.user.id;
  const username = interaction.user.username;
  const titulo = interaction.options.getString('titulo', true);
  const conteudo = interaction.options.getString('conteudo', true);

  if (titulo.length > 100) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('O título deve ter no máximo 100 caracteres!')
      .setColor(Colors.Red);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (conteudo.length > 4000) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('O conteúdo deve ter no máximo 4000 caracteres!')
      .setColor(Colors.Red);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const { data: existingStory } = await supabase
      .from('stories')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingStory) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Erro')
        .setDescription('Você já possui uma história! Use `/editar_historia` para modificá-la ou `/deletar_historia` para removê-la.')
        .setColor(Colors.Red);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const { error } = await supabase.from('stories').insert({
      user_id: userId,
      username: username,
      titulo: titulo,
      conteudo: conteudo,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      const embed = new EmbedBuilder()
        .setTitle('❌ Erro')
        .setDescription(`Ocorreu um erro ao criar a história: ${error.message}`)
        .setColor(Colors.Red);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ História Criada!')
      .setDescription(`**${titulo}**\n\nSua história foi salva com sucesso!`)
      .setColor(Colors.Green)
      .setAuthor({ 
        name: interaction.user.displayName, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setFooter({ text: 'Use /ler_historia para visualizá-la' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Create story error:', error);
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('Ocorreu um erro ao criar a história. Tente novamente!')
      .setColor(Colors.Red);
    await interaction.editReply({ embeds: [embed] });
  }
}

export async function handleReadStoryCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const targetUser = interaction.options.getUser('usuario') || interaction.user;

  await interaction.deferReply({ ephemeral: true });

  try {
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', targetUser.id)
      .single() as { data: Story | null; error: any };

    if (error || !story) {
      const embed = new EmbedBuilder()
        .setTitle('📖 História não encontrada')
        .setDescription(`**${targetUser.displayName}** ainda não criou uma história.`)
        .setColor(Colors.Orange);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const createdAt = story.created_at ? new Date(story.created_at).toLocaleDateString('pt-BR') : 'N/A';
    const updatedAt = story.updated_at ? new Date(story.updated_at).toLocaleDateString('pt-BR') : 'N/A';

    const embed = new EmbedBuilder()
      .setTitle(`📜 ${story.titulo}`)
      .setDescription(story.conteudo)
      .setColor(Colors.Blue)
      .setAuthor({ 
        name: `Autor: ${targetUser.displayName}`, 
        iconURL: targetUser.displayAvatarURL() 
      })
      .addFields(
        { name: '📅 Criada em', value: createdAt, inline: true },
        { name: '✏️ Modificada em', value: updatedAt, inline: true }
      )
      .setFooter({ text: `História de ${story.username}` });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Read story error:', error);
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('Ocorreu um erro ao ler a história. Tente novamente!')
      .setColor(Colors.Red);
    await interaction.editReply({ embeds: [embed] });
  }
}

export async function handleEditStoryCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const userId = interaction.user.id;
  const novoTitulo = interaction.options.getString('titulo');
  const novoConteudo = interaction.options.getString('conteudo');

  if (!novoTitulo && !novoConteudo) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('Você precisa fornecer pelo menos um novo título ou novo conteúdo!')
      .setColor(Colors.Red);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (novoTitulo && novoTitulo.length > 100) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('O título deve ter no máximo 100 caracteres!')
      .setColor(Colors.Red);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (novoConteudo && novoConteudo.length > 4000) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('O conteúdo deve ter no máximo 4000 caracteres!')
      .setColor(Colors.Red);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const { data: existingStory } = await supabase
      .from('stories')
      .select('id, titulo, conteudo')
      .eq('user_id', userId)
      .single() as { data: Pick<Story, 'id' | 'titulo' | 'conteudo'> | null; error: any };

    if (!existingStory) {
      const embed = new EmbedBuilder()
        .setTitle('❌ Erro')
        .setDescription('Você ainda não possui uma história! Use `/criar_historia` primeiro.')
        .setColor(Colors.Red);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const tituloFinal = novoTitulo || existingStory.titulo;
    const conteudoFinal = novoConteudo || existingStory.conteudo;

    const { error } = await supabase
      .from('stories')
      .update({
        titulo: tituloFinal,
        conteudo: conteudoFinal,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase update error:', error);
      const embed = new EmbedBuilder()
        .setTitle('❌ Erro')
        .setDescription(`Ocorreu um erro ao editar a história: ${error.message}`)
        .setColor(Colors.Red);
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const changes: string[] = [];
    if (novoTitulo) changes.push('📝 Título atualizado');
    if (novoConteudo) changes.push('📖 Conteúdo atualizado');

    const embed = new EmbedBuilder()
      .setTitle('✅ História Editada!')
      .setDescription(`**${tituloFinal}**\n\nSua história foi atualizada com sucesso!`)
      .setColor(Colors.Green)
      .setAuthor({ 
        name: interaction.user.displayName, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .addFields({ name: 'Alterações', value: changes.join('\n'), inline: false });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Edit story error:', error);
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('Ocorreu um erro ao editar a história. Tente novamente!')
      .setColor(Colors.Red);
    await interaction.editReply({ embeds: [embed] });
  }
}

export async function handleDeleteStoryCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const userId = interaction.user.id;

  const { data: existingStory } = await supabase
    .from('stories')
    .select('id, titulo')
    .eq('user_id', userId)
    .single() as { data: Pick<Story, 'id' | 'titulo'> | null; error: any };

  if (!existingStory) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Erro')
      .setDescription('Você não possui uma história para excluir!')
      .setColor(Colors.Red);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const confirmButton = new ButtonBuilder()
    .setCustomId('confirm_delete')
    .setLabel('Confirmar')
    .setEmoji('🗑️')
    .setStyle(ButtonStyle.Danger);

  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel_delete')
    .setLabel('Cancelar')
    .setEmoji('❌')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

  const embed = new EmbedBuilder()
    .setTitle('⚠️ Confirmar Exclusão')
    .setDescription(`Você tem certeza que deseja excluir sua história **"${existingStory.titulo}"**?\n\n**Esta ação não pode ser desfeita!**`)
    .setColor(Colors.Orange);

  const response = await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
    fetchReply: true,
  });

  try {
    const confirmation = await response.awaitMessageComponent({
      filter: (i) => i.user.id === userId,
      componentType: ComponentType.Button,
      time: 30_000, 
    });

    if (confirmation.customId === 'confirm_delete') {
      const { error } = await supabase.from('stories').delete().eq('user_id', userId);

      if (error) {
        console.error('Supabase delete error:', error);
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Erro')
          .setDescription(`Ocorreu um erro ao excluir a história: ${error.message}`)
          .setColor(Colors.Red);
        await confirmation.update({ embeds: [errorEmbed], components: [] });
        return;
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('🗑️ História Excluída')
        .setDescription('Sua história foi excluída com sucesso!')
        .setColor(Colors.Green);
      await confirmation.update({ embeds: [successEmbed], components: [] });
    } else {
      const cancelEmbed = new EmbedBuilder()
        .setTitle('❌ Cancelado')
        .setDescription('A exclusão foi cancelada.')
        .setColor(Colors.Grey);
      await confirmation.update({ embeds: [cancelEmbed], components: [] });
    }
  } catch (error) {
    const timeoutEmbed = new EmbedBuilder()
      .setTitle('⏰ Tempo Esgotado')
      .setDescription('A operação foi cancelada por tempo limite.')
      .setColor(Colors.Grey);
    await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
  }
}
