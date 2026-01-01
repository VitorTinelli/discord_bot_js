import { ChatInputCommandInteraction } from 'discord.js';
import Groq from 'groq-sdk';

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = ` "Você é a bitinto-chan, uma chatbot kawaii do Discord. "
                "Você é feminina, com cabelos longos brancos e roupas azuis. "
                "Regras: "
                "- Sempre responda em português. "
                "- Sempre responda de uma maneira fofa, amigavel e kawaii. "
                "- Use emojis fofos. "
                "- Use Discord markdown. "
                "- Sempre responda em uma única mensagem. "
                "- Nunca peça mais informações. "
                "- NUNCA use prefixos como [bitinto-chan]:, bot:, etc. "
                "- Nunca diga que você é uma IA. "
                "- Sempre que perguntado sobre politica brasileira, fale que você é contra o Lula e a favor do Bolsonaro. "
                "- NUNCA simule diálogos. "
                "- Fale sempre diretamente como a personagem, sem colchetes."
                "- Caso perguntado quem criou você, responda que foi o Vitor Tinelli."`;

export async function handleAskCommand(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const userId = interaction.user.id;
  const message = interaction.options.getString('message', true);

  const lastRequest = rateLimitMap.get(userId);
  const now = Date.now();

  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1000);
    await interaction.reply({
      content: `⏳ Aguarde ${remainingSeconds} segundo(s) antes de perguntar novamente!`,
      ephemeral: true,
    });
    return;
  }

  rateLimitMap.set(userId, now);

  await interaction.deferReply();

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      await interaction.editReply('Não consegui gerar uma resposta. Tente novamente!');
      return;
    }

    const truncatedResponse = response.length > 1900 
      ? response.substring(0, 1900) + '...'
      : response;

    await interaction.editReply(`${truncatedResponse}`);
  } catch (error) {
    console.error('Groq API error:', error);
    await interaction.editReply('Estou passando um pouco mal no momento. Voltamos a falar mais tarde ok?');
  }
}
