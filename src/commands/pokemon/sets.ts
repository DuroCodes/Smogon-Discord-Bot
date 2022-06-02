import {
  ColorResolvable, CommandInteraction, MessageButton, MessageEmbed,
} from 'discord.js';
import { type CommandOptions, Command, ApplicationCommandRegistry } from '@sapphire/framework';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import pagination from 'discordjs-button-pagination';
import { ApplyOptions } from '@sapphire/decorators';
import Poke from 'pokemon';
import { emoji, colors, fetchSprite } from '../../util';
import { gens, smogon } from '../../lib';

@ApplyOptions<CommandOptions>({
  name: 'sets',
  description: 'Get sets for a pokemon.',
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

    const sets = await smogon.sets(gens.get(8), pokemon);

    if (!sets.length) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle(`${emoji.wrong} No sets found`)
            .setColor(colors.invisible as ColorResolvable),
        ],
      });
    }

    const evs = {
      hp: 'HP',
      spe: 'Speed',
      atk: 'Attack',
      spa: 'Special Attack',
      def: 'Defense',
      spd: 'Special Defense',
    };

    if (sets.length === 1) {
      const set = sets[0];
      const embed = new MessageEmbed()
        .setTitle(`${set?.species}${set?.item ? ` @ ${set.item}` : ''}`)
        .setColor(colors.invisible as ColorResolvable)
        .setDescription(set?.name as string)
        .setThumbnail(
          await fetchSprite(
            Poke.getId(Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string),
          ),
        )
        .addFields([
          {
            name: '⚡ Ability',
            value: set?.ability || 'Any',
          },
          {
            name: '🌿 Nature',
            value: set?.nature || 'Any',
          },
          {
            name: '💥 Moves',
            value: set?.moves?.join('\n') || 'Any',
          },
          {
            name: '♥ EVs',
            value: set?.evs ? Object.entries(set?.evs).map(([key, value]) => `${evs[key]}: ${value}`).join('\n') : 'Any',
          },
        ]);

      return interaction.reply({ embeds: [embed] });
    }

    const embedList = sets.map(async (set) => {
      const embed = new MessageEmbed()
        .setTitle(`${set?.species}${set?.item ? ` @ ${set.item}` : ''}`)
        .setColor(colors.invisible as ColorResolvable)
        .setDescription(set?.name as string)
        .setThumbnail(
          await fetchSprite(
            Poke.getId(Poke.all().find((e) => e.toLowerCase() === pokemon.toLowerCase()) as string),
          ),
        )
        .addFields([
          {
            name: '⚡ Ability',
            value: set?.ability || 'Any',
          },
          {
            name: '🌿 Nature',
            value: set?.nature || 'Any',
          },
          {
            name: '💥 Moves',
            value: set?.moves?.join('\n') || 'Any',
          },
          {
            name: '♥ EVs',
            value: set?.evs ? Object.entries(set?.evs).map(([key, value]) => `**${evs[key]}:** ${value}`).join('\n') : 'Any',
          },
        ]);

      return embed;
    });

    const embeds = await Promise.all(embedList);

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
