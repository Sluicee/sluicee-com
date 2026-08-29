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

  const message = String(body.message || "").trim().slice(0, 500);
  if (!message) {
    return e.json(400, { ok: false, error: "message is required" });
  }
  const name = String(body.name || "").trim().slice(0, 60) || "аноним";

  const record = new Record(e.app.findCollectionByNameOrId("guestbook"));
  record.set("name", name);
  record.set("message", message);
  record.set("visible", true);
  e.app.save(record);

  return e.json(200, {
    ok: true,
    entry: { name, message, created: record.get("created") },
  });
});
