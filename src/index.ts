import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { handleAskCommand } from './commands/aichat';
import {
  handleCreateStoryCommand,
  handleReadStoryCommand,
  handleEditStoryCommand,
  handleDeleteStoryCommand,
} from './commands/rpg';
import { handleDevCommand } from './commands/social';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  throw new Error('DISCORD_TOKEN environment variable is required');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Pergunte algo para a Bitinto-chan')
    .addStringOption((option) =>
      option.setName('message').setDescription('Sua pergunta').setRequired(true)
    ),

  new SlashCommandBuilder().setName('dev').setDescription('Links do desenvolvedor'),

  new SlashCommandBuilder()
    .setName('criar_historia')
    .setDescription('Cria sua história de RPG')
    .addStringOption((option) =>
      option.setName('titulo').setDescription('Título da história').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('conteudo').setDescription('Conteúdo da história').setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('ler_historia')
    .setDescription('Lê uma história de RPG')
    .addUserOption((option) =>
      option.setName('usuario').setDescription('Usuário (deixe vazio para a sua)')
    ),
  new SlashCommandBuilder()
    .setName('editar_historia')
    .setDescription('Edita sua história de RPG')
    .addStringOption((option) => option.setName('titulo').setDescription('Novo título'))
    .addStringOption((option) => option.setName('conteudo').setDescription('Novo conteúdo')),
  new SlashCommandBuilder()
    .setName('deletar_historia')
    .setDescription('Deleta sua história de RPG'),
];

client.once('clientReady', async () => {
  console.log(`✅ Bot logado como ${client.user?.tag}`);

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  try {
    console.log('🔄 Registrando comandos slash...');
    await rest.put(Routes.applicationCommands(client.user!.id), {
      body: commands.map((cmd) => cmd.toJSON()),
    });
    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'ask':
        await handleAskCommand(interaction as ChatInputCommandInteraction);
        break;

      case 'dev':
        await handleDevCommand(interaction as ChatInputCommandInteraction);
        break;

      case 'criar_historia':
        await handleCreateStoryCommand(interaction as ChatInputCommandInteraction);
        break;
      case 'ler_historia':
        await handleReadStoryCommand(interaction as ChatInputCommandInteraction);
        break;
      case 'editar_historia':
        await handleEditStoryCommand(interaction as ChatInputCommandInteraction);
        break;
      case 'deletar_historia':
        await handleDeleteStoryCommand(interaction as ChatInputCommandInteraction);
        break;

      default:
        await interaction.reply({ content: 'Comando não reconhecido.', ephemeral: true });
    }
  } catch (error) {
    console.error(`Erro ao executar comando ${commandName}:`, error);
    const reply = interaction.replied || interaction.deferred
      ? interaction.followUp.bind(interaction)
      : interaction.reply.bind(interaction);
    await reply({ content: '❌ Ocorreu um erro ao executar o comando.', ephemeral: true });
  }
});

async function main() {
  try {
    await client.login(DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

main();
