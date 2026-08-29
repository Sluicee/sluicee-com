/// <reference path="../pb_data/types.d.ts" />

// Синхронизация «кино» (Letterboxd) и «музыки» (YouTube-плейлист).
// Оба живут снаружи и требуют серверного фетча — у их RSS/API нет CORS,
// так что тянуть их напрямую из браузера нельзя.
//
// Вся логика лежит одним куском внутри cronAdd: PocketBase JSVM изолирует
// каждый routerAdd/cronAdd-колбэк от соседних top-level функций того же
// файла (они не видны внутри колбэка в момент вызова, даже если файл
// загрузился без ошибок) — поэтому helper-функции объявлены прямо тут,
// а не вынесены наружу.
cronAdd("media_sync", "*/30 * * * *", () => {
  function upsertMedia(key, data) {
    let record;
    try {
      record = $app.findFirstRecordByFilter("media", "key = {:key}", { key });
    } catch {
      record = new Record($app.findCollectionByNameOrId("media"));
      record.set("key", key);
    }
    record.set("data", data);
    $app.save(record);
  }

  function seatFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    hash = Math.abs(hash);
    const row = String.fromCharCode(65 + (hash % 12)); // A–L
    const num = (hash % 24) + 1; // 1–24
    return `${row}-${num}`;
  }

  function fetchFanartBackdrop(tmdbMovieId) {
    if (!tmdbMovieId) return null;
    const apiKey = $os.getenv("FANART_API_KEY");
    if (!apiKey) return null;
    try {
      const res = $http.send({
        url: `https://webservice.fanart.tv/v3/movies/${tmdbMovieId}?api_key=${apiKey}`,
        timeout: 15,
      });
      if (res.statusCode !== 200 || !res.json) return null;
      const priority = ["moviebackground", "moviethumb", "moviebanner"];
      for (const field of priority) {
        const list = res.json[field];
        if (Array.isArray(list) && list.length && list[0].url) {
          return list[0].url;
        }
      }
    } catch {
      // fanart недоступен/нет данных — не критично, есть fallback на постер
    }
    return null;
  }

  function syncLetterboxd() {
    const res = $http.send({ url: "https://letterboxd.com/sluicee/rss/", timeout: 15 });
    if (res.statusCode !== 200) {
      console.log("[media] letterboxd rss fetch failed:", res.statusCode);
      return;
    }
    const xml = toString(res.body);

    const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
    if (!itemMatch) return;
    const item = itemMatch[1];

    const field = (tag) => {
      const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].trim() : "";
    };

    const filmTitle = field("letterboxd:filmTitle");
    const filmYear = field("letterboxd:filmYear");
    const rating = parseFloat(field("letterboxd:memberRating")) || 0;
    const watchedDate = field("letterboxd:watchedDate");
    const link = field("link");
    const tmdbMovieId = field("tmdb:movieId");

    const descMatch = item.match(/<description>[\s\S]*?<!\[CDATA\[([\s\S]*?)\]\]>[\s\S]*?<\/description>/);
    let review = "";
    if (descMatch) {
      const paragraphs = [...descMatch[1].matchAll(/<p>([\s\S]*?)<\/p>/g)]
        .map((m) => m[1].trim())
        .filter((p) => p && !p.startsWith("<img"));
      review = paragraphs[0] || "";
    }
    const posterMatch = item.match(/<img src="([^"]+)"/);
    const posterUrl = posterMatch ? posterMatch[1] : "";

    const backdropUrl = fetchFanartBackdrop(tmdbMovieId);

    upsertMedia("film", {
      filmTitle,
      filmYear,
      rating,
      watchedDate,
      review,
      link,
      image: backdropUrl || posterUrl,
      imageIsBackdrop: Boolean(backdropUrl),
      seat: seatFromString(link || filmTitle),
      syncedAt: new Date().toISOString(),
    });

    console.log("[media] letterboxd synced:", filmTitle);
  }

  function syncYoutubePlaylist() {
    const apiKey = $os.getenv("YOUTUBE_API_KEY");
    if (!apiKey) {
      console.log("[media] YOUTUBE_API_KEY not set, skipping");
      return;
    }
    const playlistId = "PL_EK84HUJsmrJYQf9pHdhOp_ofX64XDdZ";
    const videos = [];
    let pageToken = "";

    for (let page = 0; page < 20; page++) {
      const url =
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50` +
        `&playlistId=${playlistId}&key=${apiKey}` +
        (pageToken ? `&pageToken=${pageToken}` : "");
      const res = $http.send({ url, timeout: 15 });
      if (res.statusCode !== 200 || !res.json) {
        console.log("[media] youtube fetch failed:", res.statusCode, JSON.stringify(res.json));
        break;
      }
      for (const item of res.json.items || []) {
        const snippet = item.snippet;
        if (!snippet || snippet.title === "Private video" || snippet.title === "Deleted video") continue;
        videos.push({
          id: snippet.resourceId.videoId,
          title: snippet.title,
          channel: snippet.videoOwnerChannelTitle || snippet.channelTitle || "",
        });
      }
      pageToken = res.json.nextPageToken || "";
      if (!pageToken) break;
    }

    if (!videos.length) return;

    upsertMedia("youtube_playlist", {
      videos,
      updatedAt: new Date().toISOString(),
    });

    console.log("[media] youtube playlist synced:", videos.length, "videos");
  }

  try {
    syncLetterboxd();
  } catch (e) {
    console.log("[media] letterboxd sync error:", e);
  }
  try {
    syncYoutubePlaylist();
  } catch (e) {
    console.log("[media] youtube sync error:", e);
  }
});
