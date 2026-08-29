/// <reference path="../pb_data/types.d.ts" />

// Простой счётчик хитов главной страницы: не различает посетителей,
// не хранит IP/cookies — просто атомарно увеличивает одно число.
// Коллекция `stats` закрыта от прямого доступа (все правила — null),
// так что записать в неё можно только отсюда.
routerAdd("POST", "/api/hits", (e) => {
  let record;
  try {
    record = e.app.findFirstRecordByFilter("stats", "key = 'hits'");
  } catch {
    record = new Record(e.app.findCollectionByNameOrId("stats"));
    record.set("key", "hits");
    record.set("value", 0);
  }

  record.set("value", record.get("value") + 1);
  e.app.save(record);

  return e.json(200, { count: record.get("value") });
});
