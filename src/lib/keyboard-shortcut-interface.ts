import HotKeyPad from "hotkeypad";

import stringifiedPrinterIcon from "@/assets/icons/printer.svg?raw";

interface Command {
  id: string;
  hotkey: string;
  icon: string;
  section: string;
  title: string;
  url: string;
  handler: () => void;
}

type UserDefinedCommand = Omit<Command, "handler">;

function parseCommands(rawCommands: string): Command[] {
  return JSON.parse(rawCommands)
    .map((command: UserDefinedCommand) => ({
      ...command,
      handler: () => { window.open(command.url, "_blank") },
    }));
}

const commandPalette = new HotKeyPad();
const rawCommands = commandPalette.instance.getAttribute("data-commands") ?? "[]";
const parsedUserCommands: Command[] = parseCommands(rawCommands);

commandPalette.setCommands([
  {
    id: "print",
    hotkey: "ctrl+P",
    section: "Actions",
    title: "Print resume",
    icon: stringifiedPrinterIcon,
    handler: () => { window.print(); },
  },
  ...parsedUserCommands,
]);
