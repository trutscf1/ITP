import { deflateSync } from "node:zlib";
import {
  type ContentLanguage,
  type LandingSectionKind,
  type LegalKind,
  legalTemplate,
} from "@stash/contracts/cms";

/**
 * Module content-seed (`gam-ai-knowledge/concepts/public-content.md` §16, PUB-F-7, PUB-F-13,
 * PUB-F-14, PUB-F-26): the example content of a fresh installation in German and English, all
 * published, and `seedIfEmpty`, which writes it once.
 */

type ByLanguage<T> = Record<ContentLanguage, T>;

export interface SeedImage {
  key: string;
  source: string;
  licence: string;
  mediaType: "image/png";
  bytes: Uint8Array;
  alternativeText: ByLanguage<string>;
}

export interface SeedLandingSection {
  kind: LandingSectionKind;
  position: number;
  imageKey?: string;
  text: ByLanguage<{ heading: string; body: string }>;
  published: ByLanguage<boolean>;
}

export interface SeedHelpArticle {
  helpContext?: string;
  text: ByLanguage<{ title: string; body: string; description: string }>;
  published: ByLanguage<boolean>;
}

export interface SeedHelpCategory {
  position: number;
  name: ByLanguage<string>;
  articles: SeedHelpArticle[];
}

export interface SeedChangelogEntry {
  version: string;
  releaseDate: string;
  text: ByLanguage<{ title: string; body: string }>;
  published: ByLanguage<boolean>;
}

export interface SeedLegalPage {
  kind: LegalKind;
  text: ByLanguage<{ title: string; body: string }>;
  published: ByLanguage<boolean>;
}

export interface SeedContent {
  images: SeedImage[];
  landingSections: SeedLandingSection[];
  helpCategories: SeedHelpCategory[];
  changelogEntries: SeedChangelogEntry[];
  legalPages: SeedLegalPage[];
}

/** What `seedIfEmpty` needs of the content store; the unit wires it to Strapi. */
export interface SeedStore {
  /** The number of content entries of all types. */
  countEntries(): Promise<number>;
  /** Runs `work` all-or-nothing: when it throws, no entry stays and the error is rethrown. */
  transaction<T>(work: () => Promise<T>): Promise<T>;
  /** Writes the whole seed content (every entry, every language version, every image). */
  insert(content: SeedContent): Promise<void>;
}

const published: ByLanguage<boolean> = { de: true, en: true };
const imageSource = "created for this project";
const imageLicence = "CC0-1.0";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crcTable[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** A simple generated graphic: a PNG of `size` x `size` pixels with a diagonal colour gradient. */
function gradientPng(size: number, from: number[], to: number[]): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // colour type: RGB
  const rows: Buffer[] = [];
  for (let y = 0; y < size; y += 1) {
    const row = Buffer.alloc(1 + size * 3); // filter type 0, then the pixels
    for (let x = 0; x < size; x += 1) {
      const t = (x + y) / (2 * (size - 1));
      for (let channel = 0; channel < 3; channel += 1) {
        const a = from[channel] as number;
        const b = to[channel] as number;
        row[1 + x * 3 + channel] = Math.round(a + (b - a) * t);
      }
    }
    rows.push(row);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const legalTitles: Record<LegalKind, ByLanguage<string>> = {
  imprint: { de: "Impressum", en: "Imprint" },
  terms: { de: "Nutzungsbedingungen", en: "Terms of use" },
  privacy: { de: "Datenschutzerklärung", en: "Privacy policy" },
};

/** The seed content of a fresh installation (concept §8, "Seed content"). */
export function seedContent(): SeedContent {
  const legalKinds: LegalKind[] = ["imprint", "terms", "privacy"];
  return {
    images: [
      {
        key: "hero",
        source: imageSource,
        licence: imageLicence,
        mediaType: "image/png",
        bytes: gradientPng(64, [30, 64, 175], [14, 165, 233]),
        alternativeText: {
          de: "Blauer Farbverlauf als Titelbild",
          en: "Blue colour gradient as the hero image",
        },
      },
      {
        key: "storage",
        source: imageSource,
        licence: imageLicence,
        mediaType: "image/png",
        bytes: gradientPng(64, [5, 150, 105], [163, 230, 53]),
        alternativeText: {
          de: "Grüner Farbverlauf als Sinnbild für Speicherplatz",
          en: "Green colour gradient standing for storage space",
        },
      },
    ],
    landingSections: [
      {
        kind: "hero",
        position: 1,
        imageKey: "hero",
        text: {
          de: {
            heading: "Ihre Dateien, auf Ihrem Server",
            body: "Stash ist ein selbst gehosteter Cloud-Speicher mit Vorschaubildern, Virenprüfung und Volltextsuche.",
          },
          en: {
            heading: "Your files, on your own server",
            body: "Stash is a self-hosted cloud storage with thumbnails, virus scanning, and full-text search.",
          },
        },
        published,
      },
      {
        kind: "feature",
        position: 2,
        text: {
          de: {
            heading: "Alles im Hintergrund erledigt",
            body: "Nach dem Hochladen erzeugt Stash Vorschaubilder, prüft die Datei auf Viren und macht ihren Text durchsuchbar.",
          },
          en: {
            heading: "Everything is done in the background",
            body: "After an upload, Stash creates thumbnails, checks the file for viruses, and makes its text searchable.",
          },
        },
        published,
      },
      {
        kind: "text-with-image",
        position: 3,
        imageKey: "storage",
        text: {
          de: {
            heading: "Barrierefrei und mit mehreren Designs",
            body: "Die Oberfläche lässt sich mit der Tastatur bedienen und bietet mehrere Designs mit Hell- und Dunkelmodus.",
          },
          en: {
            heading: "Accessible, with several themes",
            body: "The interface works with the keyboard and offers several themes with light and dark mode.",
          },
        },
        published,
      },
      {
        kind: "call-to-action",
        position: 4,
        text: {
          de: {
            heading: "Jetzt loslegen",
            body: "Legen Sie ein Konto an oder melden Sie sich an.",
          },
          en: {
            heading: "Get started",
            body: "Create an account or sign in.",
          },
        },
        published,
      },
    ],
    helpCategories: [
      {
        position: 1,
        name: { de: "Erste Schritte", en: "Getting started" },
        articles: [
          {
            helpContext: "first-upload",
            text: {
              de: {
                title: "Die erste Datei hochladen",
                body: "Öffnen Sie Ihren Ordner und ziehen Sie eine Datei in das Fenster. Nach dem Hochladen erscheint sie in der Liste.",
                description: "So laden Sie Ihre erste Datei hoch.",
              },
              en: {
                title: "Upload your first file",
                body: "Open your folder and drag a file into the window. After the upload it appears in the list.",
                description: "How to upload your first file.",
              },
            },
            published,
          },
          {
            helpContext: "create-folder",
            text: {
              de: {
                title: "Einen Ordner anlegen",
                body: "Wählen Sie „Neuer Ordner“, geben Sie einen Namen ein und bestätigen Sie.",
                description: "So ordnen Sie Dateien in Ordnern.",
              },
              en: {
                title: "Create a folder",
                body: "Choose “New folder”, enter a name, and confirm.",
                description: "How to arrange files in folders.",
              },
            },
            published,
          },
        ],
      },
      {
        position: 2,
        name: { de: "Konto und Sicherheit", en: "Account and security" },
        articles: [
          {
            helpContext: "change-theme",
            text: {
              de: {
                title: "Das Design wechseln",
                body: "In den Einstellungen wählen Sie ein Design und den Hell- oder Dunkelmodus.",
                description: "So ändern Sie das Aussehen der Oberfläche.",
              },
              en: {
                title: "Change the theme",
                body: "In the settings, choose a theme and light or dark mode.",
                description: "How to change the look of the interface.",
              },
            },
            published,
          },
          {
            text: {
              de: {
                title: "Das Passwort ändern",
                body: "In den Kontoeinstellungen geben Sie Ihr altes und Ihr neues Passwort ein.",
                description: "So ändern Sie Ihr Passwort.",
              },
              en: {
                title: "Change your password",
                body: "In the account settings, enter your old and your new password.",
                description: "How to change your password.",
              },
            },
            published,
          },
        ],
      },
    ],
    changelogEntries: [
      {
        version: "0.1.0",
        releaseDate: "2026-11-24",
        text: {
          de: {
            title: "Erste Version",
            body: "Die erste Version von Stash: Redaktionssystem für Startseite, Hilfe und Änderungsprotokoll.",
          },
          en: {
            title: "First version",
            body: "The first version of Stash: content management for the landing page, the help center, and the changelog.",
          },
        },
        published,
      },
    ],
    legalPages: legalKinds.map((kind) => ({
      kind,
      text: {
        de: { title: legalTitles[kind].de, body: legalTemplate(kind, "de") },
        en: { title: legalTitles[kind].en, body: legalTemplate(kind, "en") },
      },
      published,
    })),
  };
}

/**
 * Writes the seed content when the store holds no entry; with one or more entries it changes
 * nothing (PUB-F-7). The write is all-or-nothing; a failure reaches the caller.
 */
export async function seedIfEmpty(
  store: SeedStore,
): Promise<"seeded" | "skipped"> {
  if ((await store.countEntries()) > 0) return "skipped";
  const content = seedContent();
  await store.transaction(() => store.insert(content));
  return "seeded";
}
