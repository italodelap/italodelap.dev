import { contactChannels } from "@/config/site.json";

const metaGlobIcons: Record<string, any> = import.meta.glob("/src/icons/*");

export async function getContactChannelIcon(iconName: string): Promise<astroHTML.JSX.Element> {
  let component = null;
  try {
    const iconComponentPath = `/src/icons/${iconName}.astro`;
    component = (await metaGlobIcons[iconComponentPath]()).default;
  } catch (error) {
    component = (await metaGlobIcons["/src/icons/Broken.astro"]()).default;
  }

  return component;
}

export function getPrintFriendlyContactChannels() {
  return contactChannels
    .filter(({ network }) => network === "email" || network === "linkedin")
    .map(({ url }) =>
      url.replace("https://", "").replace("www.", "").replace("mailto:", ""),
    )
    .join(" • ");
}
