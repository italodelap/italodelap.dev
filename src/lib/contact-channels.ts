import { contactChannels } from "@/config/site.json";

import BrokenIcon from "@/icons/Broken.astro";
import EmailIcon from "@/icons/Email.astro";
import GithubIcon from "@/icons/Github.astro";
import LinkedInIcon from "@/icons/LinkedIn.astro";
import XIcon from "@/icons/X.astro";

function getIconsOfContactChannels() {
  return {
    email: EmailIcon,
    linkedin: LinkedInIcon,
    github: GithubIcon,
    x: XIcon,
  };
}

export function getContactChannelIcon(network: string) {
  const CONTACT_CHANNEL_ICONS = getIconsOfContactChannels();

  return CONTACT_CHANNEL_ICONS[
    network as keyof typeof CONTACT_CHANNEL_ICONS
  ] ?? BrokenIcon;
}

export function getPrintFriendlyContactChannels() {
  return contactChannels
    .filter(({ network }) => network === "email" || network === "linkedin")
    .map(({ url }) =>
      url.replace("https://", "").replace("www.", "").replace("mailto:", ""),
    )
    .join(" • ");
}
