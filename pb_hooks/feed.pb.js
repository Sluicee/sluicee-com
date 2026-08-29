/// <reference path="../pb_data/types.d.ts" />

// Atom-фид «сейчас смотрю / слушаю»: кино — из последнего синка (media.film),
// музыка — живой запрос к last.fm в момент открытия фида (не кэшируется).
routerAdd("GET", "/feed.xml", (e) => {
  function escapeXml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
    }[c]));
  }

  const entries = [];

  try {
    const filmRecord = e.app.findFirstRecordByFilter("media", "key = 'film'");
    const film = JSON.parse(toString(filmRecord.get("data")));
    if (film && film.filmTitle) {
      entries.push({
        id: film.link || `urn:sluicee:film:${film.filmTitle}`,
        title: `Смотрю: ${film.filmTitle} (${film.filmYear})`,
        link: film.link || "https://letterboxd.com/sluicee/",
        updated: film.syncedAt || new Date().toISOString(),
        summary: film.review || "",
      });
    }
  } catch {
    // нет данных о фильме — просто не добавляем эту запись
  }

  try {
    const apiKey = $os.getenv("VITE_LASTFM_API_KEY");
    if (apiKey) {
      const res = $http.send({
        url: `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=Sluicee1&api_key=${apiKey}&format=json&limit=1`,
        timeout: 10,
      });
      const track = res.json?.recenttracks?.track?.[0];
      if (track) {
        const nowPlaying = track["@attr"]?.nowplaying === "true";
        const artist = track.artist?.["#text"] || "";
        const name = track.name || "";
        entries.push({
          id: track.url || `urn:sluicee:track:${artist}-${name}`,
          title: `${nowPlaying ? "Слушаю сейчас" : "Слушал последним"}: ${artist} — ${name}`,
          link: track.url || "https://www.last.fm/user/Sluicee1",
          updated: new Date().toISOString(),
          summary: "",
        });
      }
    }
  } catch {
    // last.fm недоступен — просто не добавляем эту запись
  }

  const updated = entries.length ? entries[0].updated : new Date().toISOString();

  const entriesXml = entries
    .map(
      (entry) => `
  <entry>
    <id>${escapeXml(entry.id)}</id>
    <title>${escapeXml(entry.title)}</title>
    <link href="${escapeXml(entry.link)}"/>
    <updated>${escapeXml(entry.updated)}</updated>
    <summary>${escapeXml(entry.summary)}</summary>
  </entry>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>sluicee — сейчас смотрю / слушаю</title>
  <id>https://sluicee.com/feed.xml</id>
  <link href="https://sluicee.com/feed.xml" rel="self"/>
  <link href="https://sluicee.com/"/>
  <updated>${escapeXml(updated)}</updated>${entriesXml}
</feed>`;

  return e.blob(200, "application/atom+xml; charset=utf-8", xml);
});
