import { type contactChannels } from "@/config/site.json";

export function createCommandPaletteItem(contactChannel: typeof contactChannels[0], icon: string) {
  const { network, title, url } = contactChannel;

  return {
    url,
    icon,
    id: network,
    name: network,
    section: "Social",
    hotkey: `ctrl+${title[0]}`,
    title: `Visit ${title} profile`,
  };
}
