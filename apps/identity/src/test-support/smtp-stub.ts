// A recording SMTP server for the tests (gam-ai-knowledge/concepts/identity.md §16, "Design for
// Testability"): it keeps every message it accepts, or refuses or ignores them on request.
import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";

export interface Mail {
  from: string;
  to: string[];
  subject: string;
  text: string;
}

export interface SmtpStub {
  port: number;
  mails: Mail[];
  /** The mails sent to one address, oldest first. */
  to(address: string): Mail[];
  close(): Promise<void>;
}

export type SmtpBehaviour = "accept" | "refuse" | "silent";

export async function startSmtpStub(
  behaviour: SmtpBehaviour = "accept",
): Promise<SmtpStub> {
  const mails: Mail[] = [];
  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS", "AUTH"],
    logger: false,
    onConnect(_session, callback) {
      // A silent host never greets, so the client runs into its timeout.
      if (behaviour !== "silent") callback();
    },
    onRcptTo(_address, _session, callback) {
      if (behaviour === "refuse") {
        callback(
          Object.assign(new Error("Mailbox unavailable"), {
            responseCode: 550,
          }),
        );
        return;
      }
      callback();
    },
    onData(stream, _session, callback) {
      simpleParser(stream).then(
        (parsed) => {
          const to = parsed.to
            ? (Array.isArray(parsed.to) ? parsed.to : [parsed.to]).flatMap(
                (group) => group.value.map((entry) => entry.address ?? ""),
              )
            : [];
          mails.push({
            from: parsed.from?.value[0]?.address ?? "",
            to,
            subject: parsed.subject ?? "",
            text: parsed.text ?? "",
          });
          callback();
        },
        (error: Error) => callback(error),
      );
    },
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return {
    port,
    mails,
    to: (target) => mails.filter((mail) => mail.to.includes(target)),
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
