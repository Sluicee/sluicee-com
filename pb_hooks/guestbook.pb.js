/// <reference path="../pb_data/types.d.ts" />

// Приём записей в гостевую книгу. Коллекция закрыта от прямой записи
// (createRule: null) — попасть в неё можно только через этот роут,
// с honeypot-полем против простых ботов.
routerAdd("POST", "/api/guestbook", (e) => {
  const body = e.requestInfo().body || {};

  // honeypot: обычный посетитель это поле не видит и не заполняет.
  // Имя специально не "website"/"email" — чтобы автозаполнение браузера
  // случайно не подставило туда что-то настоящему человеку.
  // Ботам отвечаем «успехом», ничего не сохраняя — чтобы не подсказывать,
  // что их вычислили.
  if (body.hp_field && String(body.hp_field).trim() !== "") {
    return e.json(200, { ok: true });
  }

  let nameToEmoji = {};
  try {
    nameToEmoji = require(`${__hooks}/nameToEmoji.json`);
  } catch (err) {
    try {
      nameToEmoji = JSON.parse($os.readFile(`${__hooks}/nameToEmoji.json`));
    } catch (readErr) {
      console.error("[guestbook emoji load error]", readErr);
    }
  }

  function parseShortcodes(text) {
    if (!text || typeof text !== "string") return text || "";
    return text.replace(/:([a-zA-Z0-9_+-]+):/g, (match, rawCode) => {
      const code = rawCode.toLowerCase();
      return (nameToEmoji && nameToEmoji[code]) ? nameToEmoji[code] : match;
    });
  }

  const rawMessage = String(body.message || "").trim().slice(0, 500);
  if (!rawMessage) {
    return e.json(400, { ok: false, error: "message is required" });
  }
  const rawName = String(body.name || "").trim().slice(0, 60) || "аноним";

  const message = parseShortcodes(rawMessage);
  const name = parseShortcodes(rawName);

  const record = new Record(e.app.findCollectionByNameOrId("guestbook"));
  record.set("name", name);
  record.set("message", message);
  record.set("visible", true);
  e.app.save(record);

  // Уведомление в Discord (если заданы необходимые переменные окружения)
  function notifyDiscord(authorName, text) {
    const botToken = $os.getenv("DISCORD_BOT_TOKEN");
    const targetId = $os.getenv("DISCORD_USER_ID") || $os.getenv("DISCORD_CHANNEL_ID") || $os.getenv("DISCORD_TARGET_ID");
    const webhookUrl = $os.getenv("DISCORD_WEBHOOK_URL");

    if (!botToken && !webhookUrl) return;

    const embed = {
      title: "📖 Новая запись в гостевой книге",
      color: 0x5865f2,
      fields: [
        { name: "Автор", value: authorName || "аноним", inline: true },
        { name: "Сообщение", value: text.length > 1024 ? text.slice(0, 1021) + "..." : text },
      ],
      timestamp: new Date().toISOString(),
    };

    // 1. Отправка через Discord Webhook (если задан)
    if (webhookUrl) {
      try {
        const payload = { embeds: [embed] };
        if (targetId) {
          payload.content = `<@${targetId}>`;
        }
        $http.send({
          url: webhookUrl,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeout: 10,
        });
      } catch (err) {
        console.error("[discord webhook error]", err);
      }
    }

    // 2. Отправка ботом конкретному ID пользователя (в ЛС) или канала
    if (botToken && targetId) {
      try {
        let channelId = targetId;

        // Сначала пробуем открыть/получить DM-канал с пользователем
        try {
          const dmRes = $http.send({
            url: "https://discord.com/api/v10/users/@me/channels",
            method: "POST",
            headers: {
              "Authorization": `Bot ${botToken}`,
              "Content-Type": "application/json",
              "User-Agent": "PocketBase-DiscordBot (https://sluicee.com, 1.0)",
            },
            body: JSON.stringify({ recipient_id: targetId }),
            timeout: 10,
          });

          if (dmRes.statusCode === 200 && dmRes.json && dmRes.json.id) {
            channelId = dmRes.json.id;
          }
        } catch (dmErr) {
          // Если открытие DM не удалось (например, targetId уже ID канала), используем targetId напрямую
          console.error("[discord dm lookup notice]", dmErr);
        }

        const msgRes = $http.send({
          url: `https://discord.com/api/v10/channels/${channelId}/messages`,
          method: "POST",
          headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "User-Agent": "PocketBase-DiscordBot (https://sluicee.com, 1.0)",
          },
          body: JSON.stringify({ embeds: [embed] }),
          timeout: 10,
        });

        if (msgRes.statusCode >= 400) {
          console.error("[discord send message error] status:", msgRes.statusCode, "response:", msgRes.raw);
        }
      } catch (err) {
        console.error("[discord bot notification error]", err);
      }
    }
  }

  try {
    notifyDiscord(name, message);
  } catch (err) {
    console.error("[guestbook discord notification exception]", err);
  }

  return e.json(200, {
    ok: true,
    entry: { name, message, created: record.get("created") },
  });
});

