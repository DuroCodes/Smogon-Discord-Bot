import { Listener, ListenerOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Interaction } from 'discord.js';
import Poke from 'pokemon';

@ApplyOptions<ListenerOptions>({
  name: 'interactionCreate',
})

export class UserListener extends Listener {
  public async run(interaction: Interaction): Promise<void> {
    if (interaction.isAutocomplete()) {
      if (['sets', 'stats'].includes(interaction.commandName)) {
        const list = Poke.all().map((e) => ({
          value: e.toLowerCase(), name: e,
        }));

        const focused = interaction.options.getFocused(true);
        const filtered = list.filter(({ value }) => value.includes(focused?.value as string));

        return interaction.respond(filtered.slice(0, 10));
      }
    }
  }
}
