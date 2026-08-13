(() => {
  "use strict";

  const state = { videos: [], filtered: [], shown: 0, pageSize: 12 };
  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[character]);
  }

  function option(value, label) {
    return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
  }

  function unique(values) {
    return [...new Set(values)].sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true })
    );
  }

  function titleCase(value) {
    return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function shortEnvironmentLabel(video) {
    return (video.environmentLabel || video.environment).replace(" Environment", "");
  }

  function populateEnvironmentFilter() {
    const scenario = $("scenario-filter").value;
    const select = $("environment-filter");
    const previous = select.value;
    const videos = scenario ? state.videos.filter((video) => video.scenario === scenario) : state.videos;
    const pairs = new Map(videos.map((video) => [video.environment, shortEnvironmentLabel(video)]));
    select.innerHTML = option("", "All environments") +
      [...pairs].map(([value, label]) => option(value, label)).join("");
    if (pairs.has(previous)) select.value = previous;
  }

  function populateFilters() {
    const scenarios = new Map(state.videos.map((video) => [video.scenario, video.scenarioLabel]));
    $("scenario-filter").innerHTML = option("", "All scenarios") +
      [...scenarios].map(([value, label]) => option(value, label)).join("");
    $("run-filter").innerHTML = option("", "All runs") +
      unique(state.videos.map((video) => video.run)).map((run) => option(run, `Run ${run}`)).join("");
    $("outcome-filter").innerHTML = option("", "All outcomes") +
      unique(state.videos.map((video) => video.outcome || "unlabeled"))
        .map((outcome) => option(outcome, titleCase(outcome))).join("");
    populateEnvironmentFilter();

    $("scenario-filter").addEventListener("change", () => {
      populateEnvironmentFilter();
      applyFilters();
    });
    ["run-filter", "environment-filter", "outcome-filter"].forEach((id) =>
      $(id).addEventListener("change", applyFilters)
    );
  }

  function applyFilters() {
    const scenario = $("scenario-filter").value;
    const run = $("run-filter").value;
    const environment = $("environment-filter").value;
    const outcome = $("outcome-filter").value;
    state.filtered = state.videos.filter((video) =>
      (!scenario || video.scenario === scenario) &&
      (!run || String(video.run) === run) &&
      (!environment || video.environment === environment) &&
      (!outcome || (video.outcome || "unlabeled") === outcome)
    );
    state.shown = 0;
    $("video-grid").innerHTML = "";
    showMore();
  }

  function card(video) {
    const outcome = video.outcome || "unlabeled";
    const outcomeClass = ["success", "failure"].includes(outcome) ? outcome : "";
    const source = `./videos/${video.src}`;
    const poster = video.poster ? `./videos/${video.poster}` : "";
    return `
      <article class="video-card">
        <video controls preload="none" poster="${escapeHtml(poster)}"
               data-src="${escapeHtml(source)}"
               aria-label="${escapeHtml(video.caption || video.id)}">
          Your browser does not support HTML video.
        </video>
        <div class="video-card-body">
          <div class="video-card-title">
            ${escapeHtml(video.scenarioLabel || video.scenario)} · Run ${escapeHtml(video.run)}
            <span class="status ${outcomeClass}">${escapeHtml(titleCase(outcome))}</span>
          </div>
          <div class="video-card-meta">
            ${escapeHtml(video.environmentLabel || video.environment)}
            ${video.caption ? ` · ${escapeHtml(video.caption)}` : ""}
          </div>
        </div>
      </article>`;
  }

  function loadVideo(video) {
    if (video.src) return;
    video.src = video.dataset.src;
    video.removeAttribute("data-src");
  }

  function setupLazyVideos(container) {
    const videos = [...container.querySelectorAll("video[data-src]:not([data-observed])")];
    if (!("IntersectionObserver" in window)) {
      videos.forEach(loadVideo);
      return;
    }
    const observer = new IntersectionObserver((entries, instance) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        loadVideo(entry.target);
        instance.unobserve(entry.target);
      });
    }, { rootMargin: "700px 0px" });
    videos.forEach((video) => {
      video.dataset.observed = "true";
      observer.observe(video);
    });
  }

  function showMore() {
    const grid = $("video-grid");
    const next = state.filtered.slice(state.shown, state.shown + state.pageSize);
    next.forEach((video) => grid.insertAdjacentHTML("beforeend", card(video)));
    state.shown += next.length;
    $("results-summary").textContent = `Showing ${state.shown} of ${state.filtered.length} videos`;
    $("load-more").hidden = state.shown >= state.filtered.length;
    setupLazyVideos(grid);
  }

  async function init() {
    try {
      const response = await fetch("./data/videos.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.videos = await response.json();
      state.filtered = [...state.videos];
      populateFilters();
      $("load-more").addEventListener("click", showMore);
      showMore();
    } catch (error) {
      $("video-grid").innerHTML = `<div class="warning">The video manifest could not be loaded: ${escapeHtml(error.message)}</div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
