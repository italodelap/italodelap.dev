import HotKeyPad from "hotkeypad";

import stringifiedPrinterIcon from "@/assets/icons/printer.svg?raw";

interface Command {
  id: string;
  hotkey: string;
  icon: string;
  section: string;
  title: string;
  url: string;
  handler?: () => void;
}

const hotKeyPad = new HotKeyPad();
const rawCommands = hotKeyPad.instance.getAttribute("data-commands") ?? "[]";
const commands: Command[] = JSON.parse(rawCommands);

hotKeyPad.setCommands([
  {
    id: "print",
    hotkey: "ctrl+P",
    section: "Actions",
    title: "Print resume",
    icon: stringifiedPrinterIcon,
    handler: () => { window.print(); },
  },
  ...commands.map((command) => ({
    ...command,
    handler: () => { window.open(command.url, "_blank"); },
  })),
]);

const footerButton = document.getElementById("footer-button");
footerButton?.addEventListener("click", () => {
  document.dispatchEvent(new KeyboardEvent("keydown", {
    key: "K",
    code: "KeyK",
    keyCode: 75,
    which: 75,
    ctrlKey: true,
    altKey: false,
    shiftKey: false,
    metaKey: false
  }));
});
