// Отдаёт /og-image.png — жёлтый штамп с текущим сэкки, перерисовывается
// раз в день внешним скриптом (deploy/og-image/generate.py) прямо в /pb_data/og-image.png.
// Пока файла нет (первый запуск, ещё не было крона) — отдаём запасной снимок,
// который лежит рядом с хуком.
routerAdd("GET", "/og-image.png", (e) => {
  const generated = "/pb_data/og-image.png";
  const fallback = __hooks + "/assets/og-image-default.png";

  let path = generated;
  try {
    $os.stat(generated);
  } catch {
    path = fallback;
  }

  const bytes = $os.readFile(path);
  e.blob(200, "image/png", bytes);
});
