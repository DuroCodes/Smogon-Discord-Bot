import {
  ColorResolvable, CommandInteraction, MessageButton, MessageEmbed,
} from 'discord.js';
import { type CommandOptions, Command, ApplicationCommandRegistry } from '@sapphire/framework';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pagination from 'discordjs-button-pagination';
import { ApplyOptions } from '@sapphire/decorators';
import Poke from 'pokemon';
import {
  emoji, colors, fetchStats, fetchSprite, fetchAbilities,
} from '../../util';
import { gens, smogon } from '../../lib';

@ApplyOptions<CommandOptions>({
  name: 'stats',
  description: 'Get the stats of a pokemon.',
  fullCategory: ['Pokemon'],
  chatInputCommand: { register: true },
  enabled: true,
})

export class UserCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
    const pokemon = interaction.options.getString('pokemon') as string;

    if (!Poke.all().map((e) => e.toLowerCase()).includes(pokemon.toLowerCase())) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emoji.wrong} This pokemon does not exist`)
            .setColor(colors.invisible as ColorResolvable),
        ],
      });
    }

    const stats = await fetchStats(
      Poke.getId(Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string),
    );

    const smogonStats = await smogon.stats(gens.get(8), pokemon);

    const statNames = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      speed: 'Speed',
      'special-attack': 'Special Attack',
      'special-defense': 'Special Defense',
    };

    interaction.deferReply();

    const embeds: MessageEmbed[] = [
      new MessageEmbed()
        .setTitle(`${Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string} | Stats`)
        .setColor(colors.invisible as ColorResolvable)
        .setThumbnail(
          await fetchSprite(
            Poke.getId(Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string),
          ),
        )
        .addFields([
          {
            name: '💫 Base Stats',
            value: `\
${stats.map(({ base, name }) => `**${statNames[name]}:** ${base}`).join('\n')}
**Total:** ${stats.map(({ base }) => base).reduce((a, b) => a + b)}`,
            inline: true,
          },
        ]),
    ];

    if (smogonStats?.teammates) {
      embeds.push(
        new MessageEmbed()
          .setTitle(`${Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string} | Stats`)
          .setColor(colors.invisible as ColorResolvable)
          .setThumbnail(
            await fetchSprite(
              Poke.getId(
                Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string,
              ),
            ),
          )
          .addFields([
            {
              name: '🤝 Teammates',
              value: Object.entries(smogonStats.teammates).slice(0, 5).map(([key, value]) => `**${key}:** ${Math.round(value * 100)}%`).join('\n'),
            },
          ]),
      );
    }

    if (smogonStats?.abilities) {
      const abilities = await fetchAbilities(
        Poke.getId(Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string),
      );
      const hiddenAbility = abilities.find(({ hidden }) => hidden);
      embeds.push(
        new MessageEmbed()
          .setTitle(`${Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string} | Stats`)
          .setColor(colors.invisible as ColorResolvable)
          .setThumbnail(
            await fetchSprite(
              Poke.getId(
                Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string,
              ),
            ),
          )
          .addFields([
            {
              name: '⚡ Abilities',
              value: Object.entries(smogonStats.abilities).map(
                ([key, value]) => (
                  key.toLowerCase().replace(' ', '-') === hiddenAbility?.name ? `**${key}:** ${Math.round(value * 100)}% ✨` : `**${key}:** ${Math.round(value * 100)}%`
                ),
              ).join('\n'),
            },
          ]),
      );
    }

    if (embeds.length === 1) return interaction.reply({ embeds: [embeds[0] as MessageEmbed] });

    const buttons = [
      new MessageButton()
        .setCustomId('prev')
        .setLabel('◀')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('next')
        .setLabel('▶')
        .setStyle('PRIMARY'),
    ];

    pagination(interaction, embeds, buttons);
  }

  public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand({
      name: this.name,
      description: this.description,
      options: [
        {
          type: ApplicationCommandOptionTypes.STRING,
          name: 'pokemon',
          description: 'The pokemon to search for.',
          required: true,
          autocomplete: true,
        },
      ],
    });
  }
}
