const MEDIA_REVISION = "20260925-content";
const VALUE_MACHINE_COVER_REVISION = "bb51a916";
const VIVID_PLATFORM_URL = "https://community-memory-prototype.vercel.app/";
const media = (src) =>
  src && src.startsWith("assets/")
    ? `${src}?v=${src.startsWith("assets/projects/value-machine/cover/") ? VALUE_MACHINE_COVER_REVISION : MEDIA_REVISION.slice(0, 8)}`
    : src;
const mediaVariant = (src, width) =>
  media(src.replace(/\.(webp|jpe?g)$/i, `-${width}.$1`));
const responsiveSet = (src) =>
  `${mediaVariant(src, 480)} 480w, ${mediaVariant(src, 960)} 960w, ${media(src)} 2000w`;
const mobileCoverSource = (src) =>
  window.matchMedia("(max-width: 760px)").matches && /\/cover\/cover\.(webp|jpe?g)$/i.test(src)
    ? src.replace(/cover\.(webp|jpe?g)$/i, "cover-mobile.$1")
    : src;
const shouldPreloadAdjacent = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return (
    !window.matchMedia("(max-width: 760px)").matches &&
    !connection?.saveData &&
    !["slow-2g", "2g", "3g"].includes(connection?.effectiveType)
  );
};
const setResponsiveImage = (img, src, sizes = "(max-width: 760px) 100vw, 80vw") => {
  img.removeAttribute("data-src");
  img.src = media(src);
  img.srcset = responsiveSet(src);
  img.sizes = sizes;
  img.decoding = "async";
};
const responsivePreloads = new Map();
const preloadResponsiveImage = (src, sizes = "(max-width: 760px) 100vw, 80vw") => {
  const selectedSource = mobileCoverSource(src);
  const key = `${selectedSource}|${sizes}`;
  if (responsivePreloads.has(key)) return responsivePreloads.get(key);
  const request = new Promise((resolve) => {
    const probe = new Image();
    let settled = false;
    let usingLocal = false;
    const finish = async () => {
      if (settled) return;
      settled = true;
      try { await probe.decode(); } catch (_) {}
      resolve({ usingLocal, resolvedSrc: usingLocal ? selectedSource : src });
    };
    const useLocal = () => {
      if (settled || usingLocal) return;
      usingLocal = true;
      probe.removeAttribute("srcset");
      probe.src = selectedSource;
    };
    probe.onload = finish;
    probe.onerror = useLocal;
    if (selectedSource !== src) {
      usingLocal = true;
      probe.fetchPriority = "high";
      probe.onerror = () => {
        probe.onerror = finish;
        probe.src = media(src);
      };
      probe.src = media(selectedSource);
      window.setTimeout(finish, 10000);
      return;
    }
    probe.sizes = sizes;
    probe.srcset = responsiveSet(src);
    probe.src = media(src);
    window.setTimeout(useLocal, 4500);
    window.setTimeout(finish, 10000);
  });
  responsivePreloads.set(key, request);
  return request;
};
const swapResponsiveImage = async (img, src, sizes) => {
  const token = String((Number(img.dataset.swapToken) || 0) + 1);
  img.dataset.swapToken = token;
  img.classList.add("media-switching");
  const { usingLocal, resolvedSrc } = await preloadResponsiveImage(src, sizes);
  if (img.dataset.swapToken !== token) return false;
  if (usingLocal) {
    img.removeAttribute("srcset");
    img.sizes = sizes;
    img.src = media(resolvedSrc || src);
  } else {
    setResponsiveImage(img, src, sizes);
  }
  try { await img.decode(); } catch (_) {}
  img.classList.remove("media-switching");
  return true;
};
const imagePath = (src) => {
  if (!src) return "";
  if (src.startsWith("assets/")) return src.split("?")[0];
  return "";
};
const configureImage = (img) => {
  const path = imagePath(img.getAttribute("src") || img.dataset.src);
  if (!path) return;
  if (!img.dataset.mediaFallback) {
    img.dataset.mediaFallback = "ready";
    img.addEventListener("error", () => {
      if (img.dataset.mediaFallback === "used") return;
      img.dataset.mediaFallback = "used";
      img.removeAttribute("srcset");
      img.src = path;
    });
  }
  if (img.dataset.src) {
    img.decoding = "async";
    img.loading = "lazy";
    return;
  }
  const isThumbnail = /-thumb\.(webp|jpe?g)$/i.test(path);
  if (!isThumbnail) {
    img.srcset = responsiveSet(path);
    if (!img.sizes)
      img.sizes = img.dataset.sizes || "(max-width: 760px) 100vw, 80vw";
  }
  if (img.getAttribute("src") !== media(path)) img.src = media(path);
  img.decoding = "async";
  if (!img.loading && img.fetchPriority !== "high") img.loading = "lazy";
};
const revealDeferredImage = (entry, observer) => {
  if (!entry.isIntersecting) return;
  const img = entry.target;
  const path = imagePath(img.dataset.src);
  img.src = media(path);
  img.removeAttribute("data-src");
  configureImage(img);
  observer.unobserve(img);
};
const deferredMediaObserver = new IntersectionObserver(
  (entries, observer) =>
    entries.forEach((entry) => revealDeferredImage(entry, observer)),
  { rootMargin: "600px 0px" },
);
const detailMediaObserver = new IntersectionObserver(
  (entries, observer) =>
    entries.forEach((entry) => revealDeferredImage(entry, observer)),
  { root: document.querySelector("#project-note"), rootMargin: "600px 0px" },
);
const registerMedia = (root = document) => {
  root.querySelectorAll("img[data-src]").forEach((img) => {
    configureImage(img);
    if (img.closest('[aria-hidden="true"]')) return;
    (img.closest("#project-note") ? detailMediaObserver : deferredMediaObserver).observe(img);
  });
  root.querySelectorAll("img[src]").forEach(configureImage);
};
new MutationObserver((mutations) => {
  mutations.forEach((mutation) =>
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (node.matches?.("img")) configureImage(node);
      registerMedia(node);
    }),
  );
}).observe(document.documentElement, { childList: true, subtree: true });
registerMedia();

const projects = [
  {
    title: "PoopSlaves",
    role: "Speculative VR system.",
    medium: "VR · interaction · research",
    image: "assets/projects/poopslaves/cover/cover.webp",
    copy: "A rule-based virtual economy where bodily waste becomes scarce, governable value. The work makes unequal extraction tangible through constrained agency.",
  },
  {
    title: "Plantiever’s Illusion",
    role: "Moving-image installation.",
    medium: "film · installation · cultural symbols",
    image: "assets/projects/plantievers-illusion/cover/cover.webp",
    copy: "A moving-image installation that keeps auspicious symbols recognisable while changing the conditions under which they are seen, felt and interpreted.",
  },
  {
    title: "The Forbidden Hue",
    role: "Heritage through virtual play.",
    medium: "VR game · heritage · narrative",
    image: "assets/projects/forbidden-hue/cover/cover.webp",
    copy: "How does immersive interaction shape users’ understanding of historical authenticity, cultural identity and narrative power?",
  },
  {
    title: "Value Machine",
    role: "Participatory art-market critique.",
    medium: "participatory installation · authorship · institutional framing",
    image: "assets/projects/value-machine/cover/cover.webp",
    copy: "Visitors feed a fictional artist-machine, generate images and participate in their valuation, exposing how reputation manufactures artistic worth.",
  },
  {
    title: "Fetorium",
    role: "Perceiving smell without physical odor.",
    medium: "interactive installation · experimental media art",
    image: "assets/projects/fetorium/cover/cover.webp",
    copy: "An odorless interactive installation that turns facial reactions to odor-associated imagery into the expansion and turbulence of a digital Odor Seed.",
  },
  {
    title: "Plated Fantasies",
    role: "Reframing food perception through multisensory interaction.",
    medium: "sensory interaction · perception · interactive installation",
    image: "assets/projects/plated-fantasies/cover/cover.webp",
    copy: "A tactile food interface that uses sound and moving image to make learned cultural and media associations visible again.",
  },
  {
    title: "Closet X",
    role: "AI wardrobe interface.",
    medium: "UX · AI recognition · virtual try-on",
    image: "assets/projects/closet-x/cover/cover.jpg",
    copy: "A wardrobe-management system connecting garment recognition, personal styling, sustainable use and virtual dressing.",
  },
  {
    title: "Navigating the Past",
    role: "Urban memory in augmented reality.",
    medium: "AR · heritage · urban experience",
    image: "assets/projects/navigating-the-past/cover/cover.webp",
    copy: "A multi-layered navigation experience reconnecting Harbin’s historic streets with archival stories, spatial memory and contemporary movement.",
  },
  {
    title: "Feeding Fear / PEEEP",
    role: "Experimental moving image.",
    medium: "video art · social psychology",
    image: "assets/projects/feeding-fear/cover/cover.webp",
    copy: "A visual investigation of how fear is repeatedly fed by institutions, environments and the social circulation of suspicion.",
  },
  {
    title: "Drown in Algae",
    role: "Ecological witnessing.",
    medium: "bio-art · coastal ecology · installation",
    image: "assets/projects/drown-in-algae/cover/cover.jpg",
    copy: "Drown in Algae explores how living interfaces and feedback mechanisms can make invisible pollution, ecological remediation, and their environmental value perceptible, intelligible, and participatory.",
  },
  {
    title: "VIVID",
    role: "An AI-assisted platform for revisiting community memories.",
    medium: "human–AI interaction · place-based memory · participatory design",
    image: "assets/projects/vivid/cover/cover.webp",
    copy: "A generative-AI-assisted platform through which residents revisit, correct, and discuss place-based community memories.",
  },
];
const projectThumbnail = (src) =>
  media(
    src.includes("/gallery/")
      ? src.replace(/\.(webp|jpe?g)$/i, "-480.$1")
      : src.replace(/\.(webp|jpe?g)$/i, "-thumb.$1"),
  );
const caseCn = [
  "一个把排泄物设为稀缺货币的推想式 VR 系统，让权力、价值与身体控制变得可感。",
  "以动态影像和空间装置重组传统吉祥符号，在熟悉与陌生之间激活文化记忆。",
  "沉浸式交互如何塑造用户对历史真实性、文化身份与叙事权力的理解？",
  "邀请观众参与艺术生产与定价，揭示声誉如何制造价值。",
  "一个没有真实气味的交互装置，将观众面对气味关联影像时的面部反应转化为数字 Odor Seed 的膨胀与躁动。",
  "将食物转化为触觉界面，通过声音与动态影像让习惯性的文化和媒体联想重新变得可见。",
  "连接衣物识别、个人造型、虚拟试穿与可持续管理的智能衣橱。",
  "用增强现实与分层导航连接哈尔滨历史街区、档案故事与当代行走。",
  "研究恐惧如何被环境、制度与社会传播持续喂养的实验影像。",
  "Drown in Algae 探索如何通过生命界面与反馈机制，让不可见的污染、生态修复及其环境价值变得可感知、可理解、可参与。",
  "一个支持居民重新讲述、修正并讨论社区空间记忆的生成式 AI 交互平台。",
];
const projectTags = [
  ["Critical Design", "VR", "Speculative"],
  ["Culture", "Moving Image", "Installation"],
  ["Cultural Heritage", "VR", "Narrative"],
  ["Art & Value", "Installation", "Participation"],
  ["Interactive Installation", "MediaPipe", "Perception"],
  ["Sensory Interaction", "Arduino", "TouchDesigner"],
  ["Product Design", "AI", "UX"],
  ["Cultural Heritage", "AR", "Architecture"],
  ["Moving Image", "Social Psychology"],
  ["Ecology", "Bio-art", "Installation"],
  ["Human–AI Interaction", "Community Memory", "Platform"],
];
const projectVideos = [
  [
    {
      id: "-NzMnuMocVc",
      title: "PoopSlaves — Main Film",
      label: "Main film / 主片",
    },
    {
      id: "4yT4qBsznL8",
      title: "PoopSlaves — Final Interactive Outcome",
      label: "Interactive outcome / 交互成果",
    },
    {
      id: "fpVo-T5GLMI",
      title: "PoopSlaves — CAVE Dome Showcase",
      label: "CAVE dome showcase / 穹顶展示",
    },
  ],
  [
    {
      id: "IBD6i4xdrcI",
      title: "Final Video Installation: Plantiever’s Illusion",
      label: "Installation film / 装置影像",
    },
    {
      id: "My_lItiLHj4",
      title: "Plantiever’s Illusion — 3 minute version",
      label: "3-minute version / 3分钟版",
    },
    {
      id: "gG6JZPkrJ_g",
      title: "Plantiever’s Illusion — 5 minute version",
      label: "5-minute version / 5分钟版",
    },
  ],
  [],
  [
    {
      id: "tD2CHMm-ljE",
      title: "The Value Machine",
      label: "Installation demonstration / 装置演示",
    },
  ],
  [{ id: "fRwI4zcNDsA", title: "Fetorium 8K", label: "Final film / 最终影像" }],
  [
    {
      id: "fV_Jrce0Wlg",
      title: "Plated Fantasies",
      label: "Interactive installation / 互动装置",
    },
  ],
  [{ id: "7PBkRF7aY6c", title: "Closet X", label: "System film / 系统展示" }],
  [],
  [{ id: "bo7ichlhwmQ", title: "Feeding Fear", label: "Full film / 完整影像" }],
  [],
  [],
];
const publications = {
  0: {
    title:
      "Excremental Economy: A Rule-Based Speculative System for Staging Bodily Commodification and Unequal Value Extraction",
    meta: "Y. Chen, R. Du, G. Li · Creativity and Cognition 2026 · pp. 1622–1626",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=yYgrzP8AAAAJ&citation_for_view=yYgrzP8AAAAJ:u-x6o8ySG0sC",
  },
  1: {
    title:
      "Unsettling the Auspicious Pine: A Digitally Mediated Moving-Image Installation for Reflective Reinterpretation",
    meta: "Y. Chen, M. Guo · Creativity and Cognition 2026 · pp. 1616–1621",
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=yYgrzP8AAAAJ&citation_for_view=yYgrzP8AAAAJ:u5HHmVD_uO8C",
  },
};
const poopPortfolioSeries = [
  "assets/projects/poopslaves/portfolio/spread-01.webp",
  "assets/projects/poopslaves/portfolio/spread-02.webp",
  "assets/projects/poopslaves/portfolio/spread-03.webp",
  "assets/projects/poopslaves/portfolio/spread-04.webp",
  "assets/projects/poopslaves/portfolio/spread-05.webp",
  "assets/projects/poopslaves/portfolio/spread-06.webp",
];
const plantieverPortfolioSeries = [
  "assets/projects/plantievers-illusion/portfolio/spread-01.webp",
  "assets/projects/plantievers-illusion/portfolio/spread-02.webp",
  "assets/projects/plantievers-illusion/portfolio/spread-03.webp",
  "assets/projects/plantievers-illusion/portfolio/spread-04.webp",
];
const plantieverOutcomeGallery = [
  "assets/projects/plantievers-illusion/gallery/outcome-01.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-02.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-03.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-04.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-05.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-07.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-08.webp",
  "assets/projects/plantievers-illusion/gallery/outcome-09.webp",
];
const valueMachineOutcomeGallery = [
  "assets/projects/value-machine/gallery/outcome-01.webp",
  "assets/projects/value-machine/gallery/outcome-02.webp",
  "assets/projects/value-machine/gallery/outcome-03.webp",
  "assets/projects/value-machine/gallery/outcome-04.webp",
  "assets/projects/value-machine/gallery/outcome-05.webp",
  "assets/projects/value-machine/gallery/outcome-06.webp",
  "assets/projects/value-machine/gallery/outcome-07.webp",
];
const valueMachinePortfolioSeries = [
  "assets/projects/value-machine/portfolio/spread-01.webp",
  "assets/projects/value-machine/portfolio/spread-02.webp",
  "assets/projects/value-machine/portfolio/spread-03.webp",
  "assets/projects/value-machine/portfolio/spread-04.webp",
  "assets/projects/value-machine/portfolio/spread-05.webp",
];
const fetoriumPortfolioSeries = [
  "assets/projects/fetorium/portfolio/spread-01.webp",
  "assets/projects/fetorium/portfolio/spread-02.webp",
  "assets/projects/fetorium/portfolio/spread-03.webp",
  "assets/projects/fetorium/portfolio/spread-04.webp",
  "assets/projects/fetorium/portfolio/spread-05.webp",
];
const platedFantasiesPortfolioSeries = [
  "assets/projects/plated-fantasies/portfolio/spread-01.webp",
  "assets/projects/plated-fantasies/portfolio/spread-02.webp",
  "assets/projects/plated-fantasies/portfolio/spread-03.webp",
  "assets/projects/plated-fantasies/portfolio/spread-04.webp",
];
const portfolioSeries = {
  PoopSlaves: poopPortfolioSeries,
  "Plantiever’s Illusion": plantieverPortfolioSeries,
  "Value Machine": valueMachinePortfolioSeries,
  Fetorium: fetoriumPortfolioSeries,
  "Plated Fantasies": platedFantasiesPortfolioSeries,
};
// Keep every project's parallel content aligned with the curated portfolio order.
const displayOrder = [0, 3, 1, 4, 5, 6, 7, 10, 8, 9, 2];
const reorder = (items) => displayOrder.map((index) => items[index]);
projects.splice(0, projects.length, ...reorder(projects));
caseCn.splice(0, caseCn.length, ...reorder(caseCn));
projectTags.splice(0, projectTags.length, ...reorder(projectTags));
const originalVideos = [...projectVideos];
projectVideos.splice(0, projectVideos.length, ...reorder(originalVideos));
const originalPublications = { ...publications };
Object.keys(publications).forEach((key) => delete publications[key]);
displayOrder.forEach((originalIndex, newIndex) => {
  if (originalPublications[originalIndex])
    publications[newIndex] = originalPublications[originalIndex];
});
let current = 0,
  locked = false,
  currentView = "home";
let overlayOpener = null;
let categoryOrigin = null;
let detailOriginPanel = null;
let noteNavLocked = false;
let suppressNextRouteRestore = false;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const image = document.querySelector("#active-image"),
  title = document.querySelector("#active-title"),
  role = document.querySelector("#active-role"),
  num = document.querySelector("#active-no"),
  medium = document.querySelector("#active-medium"),
  activeTags = document.querySelector("#active-tags"),
  dots = document.querySelector("#dots"),
  list = document.querySelector("#project-list"),
  home = document.querySelector("#home"),
  work = document.querySelector("#work"),
  homeShortcut = document.querySelector("#home-shortcut"),
  mosaic = document.querySelector("#portrait-mosaic");
const setLayerState = (element, isActive) => {
  element.inert = !isActive;
  element.setAttribute("aria-hidden", String(!isActive));
};
const syncInteractiveState = () => {
  const openPanel = document.querySelector(".panel.open");
  const noteOpen = note?.classList.contains("open");
  const overlayOpen = Boolean(openPanel || noteOpen);
  setLayerState(home, currentView === "home" && !overlayOpen);
  setLayerState(work, currentView === "work" && !overlayOpen);
  document.querySelectorAll(".panel").forEach((panel) =>
    setLayerState(panel, panel === openPanel && !noteOpen),
  );
  if (note) setLayerState(note, noteOpen);
  if (homeShortcut) homeShortcut.hidden = currentView === "home" || !overlayOpen;
};
function enterWork(instant = false) {
  if (currentView === "work") return;
  currentView = "work";
  closePanels(false);
  // Returning from the landing page must always start from the first curated work.
  // Resetting the transition guard also prevents a cached/missed image load from
  // leaving the previous project (for example Value Machine) on screen.
  locked = false;
  show(0, true);
  if (instant) document.querySelector(".site-shell").classList.add("instant-work");
  home.classList.add("exit");
  work.classList.add("active");
  work.setAttribute("aria-hidden", "false");
  syncInteractiveState();
}
function returnHome() {
  currentView = "home";
  if (note.classList.contains("open")) closeNote(false, false);
  closePanels(false);
  clearProjectRoute();
  document.querySelector(".site-shell").classList.remove("instant-work");
  home.classList.remove("exit");
  work.classList.remove("active");
  work.setAttribute("aria-hidden", "true");
  syncInteractiveState();
}
const openWorkIndex = () => {
  enterWork(true);
  document.querySelector('[data-open="index"]').click();
};
document.querySelector("#enter-work").onclick = openWorkIndex;
document.querySelector('[data-home-panel="about"]').onclick = () =>
  document.querySelector('[data-open="about"]').click();
document.querySelector("#home-work").onclick = openWorkIndex;
document.querySelector("#back-home").onclick = returnHome;
homeShortcut.addEventListener("click", returnHome);
projects.forEach((p, i) => {
  const dot = document.createElement("button");
  dot.setAttribute("aria-label", `Open ${p.title}`);
  dot.onclick = () => show(i);
  dots.append(dot);
  const item = document.createElement("button");
  item.className = "project-item";
  item.innerHTML = `<img data-src="${projectThumbnail(p.image)}" alt="${p.title} project cover" loading="lazy" decoding="async"><span>${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span><strong>${p.title}</strong>`;
  item.onclick = () => {
    detailOriginPanel = { name: "index", scrollTop: item.closest(".panel").scrollTop };
    show(i, true);
    closePanels(false);
    openNote();
  };
  list.append(item);
});
let returnCategory = null;
function tagButtons(index, target) {
  target.innerHTML = projectTags[index]
    .map(
      (tag) => `<button class="tag-button" data-tag="${tag}">${tag}</button>`,
    )
    .join("");
  target.querySelectorAll("[data-tag]").forEach(
    (button) =>
      (button.onclick = (e) => {
        e.stopPropagation();
        overlayOpener = e.currentTarget;
        openCategory(button.dataset.tag);
      }),
  );
}
function openCategory(tag) {
  categoryOrigin = note.classList.contains("open")
    ? { project: current, scrollTop: note.scrollTop }
    : null;
  closeNote(false, false);
  closePanels(false);
  returnCategory = tag;
  const panel = document.querySelector("#category-panel"),
    gallery = document.querySelector("#category-list");
  document.querySelector("#category-title").textContent =
    `${tag} Gallery / ${tag}`;
  document.querySelector("#category-lead").textContent =
    `Projects connected through ${tag}. Browse the archive, then open any full project without losing this collection.`;
  gallery.innerHTML = "";
  projects.forEach((p, i) => {
    if (!projectTags[i].includes(tag)) return;
    const item = document.createElement("button");
    item.className = "project-item";
    item.innerHTML = `<img data-src="${projectThumbnail(p.image)}" alt="${p.title} project cover" loading="lazy" decoding="async"><span>${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span><strong>${p.title}</strong><em>${projectTags[i].join(" · ")}</em>`;
    item.onclick = () => {
      detailOriginPanel = null;
      show(i, true);
      closePanels(false);
      openNote();
    };
    gallery.append(item);
  });
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  syncInteractiveState();
  registerMedia(panel);
  panel.querySelector("[data-close], #close-category")?.focus();
}
document.querySelector("#close-category").onclick = () => {
  returnCategory = null;
  const origin = categoryOrigin;
  categoryOrigin = null;
  closePanels(false);
  if (origin) {
    show(origin.project, true);
    openNote(false);
    note.scrollTop = origin.scrollTop;
  } else if (overlayOpener?.isConnected && !overlayOpener.closest("[inert]")) {
    overlayOpener.focus();
  }
};
tagButtons(0, activeTags);
let showSequence = 0;
function show(index, instant = false) {
  if (locked) return;
  locked = true;
  const sequence = ++showSequence;
  current = (index + projects.length) % projects.length;
  const p = projects[current];
  const render = () => {
    title.textContent = p.title;
    role.textContent = p.role;
    num.textContent = `${String(current + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    medium.textContent = p.medium;
    document.querySelector(".project-link span").textContent = p.title === "VIVID" ? "Platform" : "Selected project";
    document.querySelector("#read-project").textContent = p.title === "VIVID" ? "Open platform ↗" : "View project →";
    tagButtons(current, activeTags);
    document.querySelectorAll(".dots button").forEach((d, i) => {
      d.classList.toggle("active", i === current);
      if (i === current) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  };
  if (instant) {
    image.dataset.swapToken = String((Number(image.dataset.swapToken) || 0) + 1);
    setResponsiveImage(image, p.image, "100vw");
    render();
    image.classList.remove("changing", "media-switching");
    title.classList.remove("changing");
    role.classList.remove("changing");
    locked = false;
    return;
  }
  image.classList.add("changing");
  title.classList.add("changing");
  role.classList.add("changing");
  setTimeout(async () => {
    if (sequence !== showSequence) return;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      image.classList.remove("changing");
      title.classList.remove("changing");
      role.classList.remove("changing");
      locked = false;
    };
    render();
    await swapResponsiveImage(image, p.image, "100vw");
    if (sequence !== showSequence) return;
    finish();
    if (shouldPreloadAdjacent()) {
      preloadResponsiveImage(projects[(current + 1) % projects.length].image, "100vw");
      preloadResponsiveImage(projects[(current - 1 + projects.length) % projects.length].image, "100vw");
    }
  }, 260);
}
const next = () => show(current + 1),
  prev = () => show(current - 1);
document.querySelector("#next-project")?.addEventListener("click", next);
document.querySelector("#next-project-small").onclick = next;
document.querySelector("#prev-project").onclick = prev;
let workSwipeStart = null;
work.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button,a")) return;
  workSwipeStart = { x: event.clientX, y: event.clientY };
});
work.addEventListener("pointerup", (event) => {
  if (!workSwipeStart || innerWidth > 760) return;
  const dx = event.clientX - workSwipeStart.x;
  const dy = event.clientY - workSwipeStart.y;
  workSwipeStart = null;
  if (Math.abs(dx) < 54 || Math.abs(dx) <= Math.abs(dy)) return;
  dx < 0 ? next() : prev();
});
work.addEventListener("pointercancel", () => (workSwipeStart = null));
const navigateNote = (direction) => {
  if (noteNavLocked) return;
  noteNavLocked = true;
  const buttons = [document.querySelector("#note-prev"), document.querySelector("#note-next")];
  buttons.forEach((button) => (button.disabled = true));
  note.classList.add("is-switching");
  setTimeout(() => {
    show(current + direction, true);
    fillNote();
    enhancePortfolioRails();
    registerMedia(note);
    note.scrollTo(0, 0);
    setProjectRoute(current, true);
    document.title = `${projects[current].title} — Yutong Chen`;
    document.querySelector('meta[name="description"]').content = projects[current].copy;
    note.classList.remove("is-switching");
    noteNavLocked = false;
    buttons.forEach((button) => (button.disabled = false));
  }, reducedMotion ? 0 : 140);
};
document.querySelector("#note-next").onclick = () => navigateNote(1);
document.querySelector("#note-prev").onclick = () => navigateNote(-1);
addEventListener("keydown", (e) => {
  const isInteractive = e.target.closest?.("button,a,input,textarea,select");
  const overlayOpen = note.classList.contains("open") || document.querySelector(".panel.open");
  if (note.classList.contains("open") && !isInteractive && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    navigateNote(e.key === "ArrowRight" ? 1 : -1);
    return;
  }
  if (!overlayOpen && !isInteractive && currentView === "home" && e.key === "ArrowDown") {
    enterWork();
    return;
  }
  if (
    !overlayOpen && !isInteractive && currentView === "work" &&
    (e.key === "ArrowRight" || e.key === "ArrowDown")
  )
    next();
  if (!overlayOpen && !isInteractive && currentView === "work" && (e.key === "ArrowLeft" || e.key === "ArrowUp"))
    prev();
  if (e.key === "Escape") {
    if (note.classList.contains("open")) closeNote();
    else if (document.querySelector(".panel.open")) closePanels();
  }
});

let pageNavigationLocked = false;
const changeTopLevelView = (direction) => {
  if (pageNavigationLocked || note.classList.contains("open") || document.querySelector(".panel.open")) return false;
  if (direction > 0 && currentView === "home") enterWork();
  else if (direction > 0 && currentView === "work") next();
  else if (direction < 0 && currentView === "work" && current === 0) returnHome();
  else if (direction < 0 && currentView === "work") prev();
  else return false;
  pageNavigationLocked = true;
  setTimeout(() => (pageNavigationLocked = false), reducedMotion ? 0 : 760);
  return true;
};
addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 18) return;
  if (changeTopLevelView(Math.sign(event.deltaY))) event.preventDefault();
}, { passive: false });

let pageSwipeStart = null;
[home, work].forEach((screen) => {
  screen.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest("button,a")) return;
    pageSwipeStart = { x: event.clientX, y: event.clientY };
  });
  screen.addEventListener("pointerup", (event) => {
    if (!pageSwipeStart) return;
    const dx = event.clientX - pageSwipeStart.x;
    const dy = event.clientY - pageSwipeStart.y;
    pageSwipeStart = null;
    if (Math.abs(dy) < 60 || Math.abs(dy) <= Math.abs(dx)) return;
    changeTopLevelView(dy < 0 ? 1 : -1);
  });
  screen.addEventListener("pointercancel", () => (pageSwipeStart = null));
});
function closePanels(restoreFocus = true) {
  document.querySelectorAll(".panel").forEach((p) => {
    p.classList.remove("open");
    p.setAttribute("aria-hidden", "true");
  });
  syncInteractiveState();
  if (restoreFocus && overlayOpener?.isConnected) overlayOpener.focus();
}
document.querySelectorAll("[data-open]").forEach(
  (b) =>
    (b.onclick = () => {
      overlayOpener = b;
      closePanels(false);
      const p = document.querySelector(`[data-panel="${b.dataset.open}"]`);
      p.classList.add("open");
      p.setAttribute("aria-hidden", "false");
      syncInteractiveState();
      registerMedia(p);
      p.querySelector("[data-close]")?.focus();
    }),
);
document
  .querySelectorAll("[data-close]")
  .forEach((b) => (b.onclick = closePanels));
document.querySelectorAll("[data-project-title]").forEach((link) => {
  link.onclick = (event) => {
    event.preventDefault();
    const projectIndex = projects.findIndex(
      (project) => project.title === link.dataset.projectTitle,
    );
    if (projectIndex < 0) return;
    const originPanel = link.closest("[data-panel]");
    detailOriginPanel = originPanel
      ? { name: originPanel.dataset.panel, scrollTop: originPanel.scrollTop }
      : null;
    closePanels(false);
    show(projectIndex, true);
    openNote();
  };
});
const note = document.querySelector("#project-note");
function fillNote() {
  const p = projects[current];
  const videos = projectVideos[current];
  note.classList.toggle(
    "poop-note",
    ["PoopSlaves", "Plantiever’s Illusion", "Value Machine", "Fetorium", "Plated Fantasies", "Closet X", "Navigating the Past", "VIVID", "Feeding Fear / PEEEP", "Drown in Algae", "The Forbidden Hue"].includes(p.title),
  );
  note.classList.toggle("single-video-note", videos.length === 1 || p.title === "VIVID");
  note.classList.toggle("plantiever-note", p.title === "Plantiever’s Illusion");
  note.classList.toggle("value-note", p.title === "Value Machine");
  note.classList.toggle("fetorium-note", p.title === "Fetorium");
  const detailHeroImages = {
    "Plated Fantasies": "assets/projects/plated-fantasies/detail/hero.jpg",
    "Closet X": "assets/projects/closet-x/gallery/outcome-01.jpg",
    "Navigating the Past": p.image,
    VIVID: p.image,
    "Feeding Fear / PEEEP": p.image,
    "Drown in Algae": p.image,
    "The Forbidden Hue": p.image,
  };
  const caseHero = document.querySelector(".case-hero");
  const detailHeroImage = detailHeroImages[p.title];
  if (detailHeroImage)
    caseHero.style.setProperty("background-image", `url('${media(detailHeroImage)}')`, "important");
  else caseHero.style.removeProperty("background-image");
  document.querySelector("#note-type").textContent = p.medium;
  document.querySelector("#note-title").textContent = p.title;
  document.querySelector("#case-video-links").innerHTML = p.title === "VIVID"
    ? `<a href="${VIVID_PLATFORM_URL}" target="_blank" rel="noreferrer">Open platform / 访问平台 ↗</a>`
    : videos.map((v, i) => `<a href="https://youtu.be/${v.id}" target="_blank" rel="noreferrer">${videos.length > 1 ? `Video ${i + 1}` : "Watch video"} · ${v.label} ↗</a>`).join("");
  document.querySelector("#note-copy").textContent = p.copy;
  document.querySelector("#note-cn").textContent = caseCn[current];
  tagButtons(current, document.querySelector("#case-tags"));
  document.querySelector("#case-count").textContent =
    `${String(current + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  const previousProject = projects[(current - 1 + projects.length) % projects.length];
  const nextProject = projects[(current + 1) % projects.length];
  const previousButton = document.querySelector("#note-prev");
  const nextButton = document.querySelector("#note-next");
  previousButton.setAttribute("aria-label", `Previous project: ${previousProject.title}`);
  nextButton.setAttribute("aria-label", `Next project: ${nextProject.title}`);
  if (p.title === "PoopSlaves") {
    renderPoopSlaves();
    return;
  }
  const leadWithDesignSection = ["Closet X", "Navigating the Past"].includes(p.title);
  const sections = ["Plantiever’s Illusion", "Fetorium", "Plated Fantasies", "Drown in Algae", "VIVID"].includes(p.title) || leadWithDesignSection
    ? []
    : [["01", "Final outcome", "最终成果", p.copy, caseCn[current]]];
  const detailOutcomeImages = {
    "Closet X": "assets/projects/closet-x/gallery/outcome-01.jpg",
    "Navigating the Past": "assets/projects/navigating-the-past/gallery/outcome-01.webp",
    "Feeding Fear / PEEEP": "assets/projects/feeding-fear/gallery/outcome-01.webp",
    "The Forbidden Hue": "assets/projects/forbidden-hue/gallery/outcome-01.webp",
  };
  const outcomeImage = detailOutcomeImages[p.title] || p.image;
  document.querySelector("#case-sections").innerHTML = sections.map((s) => `<section class="case-section"><div class="case-label"><span>${s[0]}</span><h3>${s[1]}<small>${s[2]}</small></h3></div><div class="case-body"><div class="bilingual-pair"><p lang="en">${s[3]}</p><p class="case-cn" lang="zh">${s[4]}</p></div>${!["Plantiever’s Illusion", "Value Machine"].includes(p.title) ? `<img class="outcome-image" data-src="${outcomeImage}" alt="${p.title} final outcome" loading="lazy" decoding="async">` : ""}</div></section>`).join("");
  const container = document.querySelector("#case-sections"),
    publication = publications[current];
  let sectionNumber = sections.length + 1;
  const appendEditorial = (title, cnTitle, body) =>
    container.insertAdjacentHTML("beforeend", `<section class="case-section case-editorial-section"><div class="case-label"><span>${String(sectionNumber++).padStart(2, "0")}</span><h3>${title}<small>${cnTitle}</small></h3></div><div class="case-body case-editorial">${body}</div></section>`);
  const appendOutcome = () =>
    container.insertAdjacentHTML("beforeend", `<section class="case-section"><div class="case-label"><span>${String(sectionNumber++).padStart(2, "0")}</span><h3>Final outcome<small>最终成果</small></h3></div><div class="case-body"><div class="bilingual-pair"><p lang="en">${p.copy}</p><p class="case-cn" lang="zh-CN">${caseCn[current]}</p></div><img class="outcome-image" data-src="${outcomeImage}" alt="${p.title} final outcome" loading="lazy" decoding="async"></div></section>`);
  if (p.title === "Drown in Algae") {
    appendEditorial("Overview", "项目概述", `
      <div class="bilingual-pair"><p lang="en">Drown in Algae begins with coastal oil pollution in Zhoushan and asks how an environmental process that is difficult for the public to perceive can become visible. The project proposes an eco-art system built around an algal biofilm that participates in oil-pollution remediation and carbon fixation. The installation translates these slow ecological processes into observable information, treating remediation itself as a public interface.</p><p class="case-cn" lang="zh-CN">Drown in Algae 从舟山沿海的石油污染问题出发，探索如何让难以被公众持续感知的海洋污染变得可见。项目提出一套以藻类生物膜为核心的生态艺术系统，设想利用藻类参与石油污染处理与二氧化碳固定，并将缓慢发生的生态过程转化为可观察的信息，让修复本身成为一种公共界面。</p></div>`);
    appendEditorial("Research Question", "研究问题", `
      <div class="bilingual-pair poop-question"><p lang="en">How can invisible marine pollution be made perceptible, and how can people see remediation as it happens?</p><p class="case-cn" lang="zh-CN">我们如何让难以直接感知的海洋污染变得可见，并让公众理解修复正在如何发生？</p></div>`);
    appendEditorial("From Pollution to Perception", "从污染到感知", `
      <div class="bilingual-pair"><p lang="en">Oil pollution does not always remain visibly black. Once dispersed, diluted, or left as a persistent residue, its ecological damage can become distant from everyday experience. Drown in Algae gives visible form to algal growth, pollutant removal, and carbon capture so that slow environmental change can be perceived.</p><p class="case-cn" lang="zh-CN">石油污染并不总是以黑色油污的形式出现。污染在海洋环境中扩散、稀释或长期残留后，生态损害会与公众的日常经验产生距离。Drown in Algae 将藻类生长、污染物处理和碳吸收转化为可见表达，使缓慢的环境变化能够被感知。</p></div>`);
    appendEditorial("System Logic", "系统逻辑", `
      <div class="bilingual-pair"><p class="case-flow" lang="en">Polluted Water → Algae-Based Installation → Pollutant Removal → Algal Growth → Environmental Data → Visual Feedback</p><p class="case-cn case-flow" lang="zh-CN">污染海水 → 藻类生态装置 → 污染物处理 → 藻类生长 → 环境数据记录 → 可视化反馈</p></div>
      <div class="bilingual-pair"><p lang="en">The algal biofilm performs an ecological role while the visual layer translates water conditions, growth, and remediation progress into public-facing information.</p><p class="case-cn" lang="zh-CN">藻类生物膜承担生态功能，视觉层则把水质、藻类生长与修复进度转化为公众可以理解的信息。</p></div>`);
    appendEditorial("Prototype & Estimation", "原型与效能估算", `
      <div class="bilingual-pair"><p lang="en">The prototype contains approximately <strong>1,342.7 cm²</strong> of effective algal biofilm. Using the design assumptions of 0.1 mg/cm²/day oil-removal efficiency and 10 mg/L pollution concentration, its theoretical capacity is approximately <strong>134.27 mg of oil, or 13.4 L of seawater, per day</strong>. These are design-stage estimates, not validated field-performance measurements.</p><p class="case-cn" lang="zh-CN">原型中的藻类生物膜有效面积约为 <strong>1342.7 cm²</strong>。按设计阶段采用的 0.1 mg/cm²/day 净化效率和 10 mg/L 污染浓度估算，理论每日处理量约为 <strong>134.27 mg 石油，即约 13.4 L 海水</strong>。这些数字用于估算装置尺度，并非实际环境部署后的性能验证。</p></div>`);
    appendEditorial("Beyond Remediation", "从修复到公共参与", `
      <div class="bilingual-pair"><p lang="en">The project proposes recording algal growth, pollutant removal, and carbon-fixation data and translating them into a public visual interface. If carbon fixation could later be reliably measured and certified, it might connect to carbon-credit mechanisms as a possible source of long-term operational support. This remains a proposed system model rather than an implemented trading system.</p><p class="case-cn" lang="zh-CN">项目设想持续记录藻类生长、污染处理与碳固定数据，并通过公共视觉界面呈现。如果未来碳固定能够被可靠测量、核算和认证，其环境效益可能进一步连接碳积分机制，为生态装置的长期运行提供支持。这是系统构想，并非已经实现的交易系统。</p></div>
      <div class="bilingual-pair"><p class="case-flow" lang="en">Restore the environment · Reveal ecological change · Support public engagement</p><p class="case-cn case-flow" lang="zh-CN">修复环境 · 呈现变化 · 建立公众参与</p></div>
      <img class="outcome-image" data-src="${p.image}" alt="Drown in Algae ecological installation" loading="lazy" decoding="async">`);
  }
  if (p.title === "Plated Fantasies") {
    appendEditorial("Overview", "项目概述", `
      <div class="bilingual-pair"><p lang="en">Plated Fantasies explores how our perception of familiar foods is shaped by learned cultural and media associations. The project turns food into a tactile interface: touching or pressing different objects triggers corresponding sounds and moving images, remapping familiar objects through multisensory feedback. It asks how we learn to interpret an object and how interaction can make habitual associations visible again.</p><p class="case-cn" lang="zh-CN">Plated Fantasies 探索我们对熟悉食物的感知如何受到文化经验和媒体影像的影响。项目将食物转化为可触摸的交互界面：参与者触碰或按压不同食物时，装置触发对应的声音与动态影像，通过多感官反馈重新映射熟悉物体。项目关注我们如何学会理解一个物体，以及交互如何让习惯性的联想重新变得可见。</p></div>`);
    appendEditorial("Research Question", "研究问题", `
      <div class="bilingual-pair poop-question"><p lang="en">How can sound, touch, and moving image reshape the way we interpret familiar objects?</p><p class="case-cn" lang="zh-CN">交互中的声音、触觉与影像，如何改变我们对熟悉物体的理解？</p></div>`);
    appendEditorial("Interaction Logic", "交互逻辑", `
      <div class="bilingual-pair"><p class="case-flow" lang="en">Touch / Press → Sensor Input → Audiovisual Response → Perceptual Remapping</p><p class="case-cn case-flow" lang="zh-CN">触碰 / 按压食物 → 传感器输入 → 声音与影像触发 → 感知重新映射</p></div>
      <div class="bilingual-pair"><p lang="en">Participants touch or press different food objects. Arduino captures the sensor input and triggers corresponding sound and moving-image responses in TouchDesigner. Connecting tactile input with unexpected audiovisual feedback interrupts automatic interpretations of familiar objects.</p><p class="case-cn" lang="zh-CN">参与者触碰不同的食物装置后，Arduino 读取传感器输入，并触发 TouchDesigner 中对应的声音和动态影像。装置通过连接触觉输入与非预期的视听反馈，打断参与者对熟悉物体的自动判断。</p></div>`);
  }
  if (p.title === "The Forbidden Hue") {
    appendEditorial("Overview", "项目概述", `
      <div class="bilingual-pair"><p lang="en">The Forbidden Hue is a cross-media cultural heritage project combining situated mystery play, digital narrative, and VR. Based on field research in Tiegang Village, cultural materials including Yao and Zhuang wedding customs, rituals, clothing, architecture, and traditional practices were translated into characters, clues, and spatial scenes. Players encounter this material through exploration, investigation, and digital interaction rather than through static explanation.</p><p class="case-cn" lang="zh-CN">《五色缚》是一个融合实景推理、数字叙事与 VR 的文化遗产项目。项目基于铁岗村田野调研，将瑶族、壮族村落中的婚俗、祭祀、服饰、建筑与传统技艺转译为角色、线索和空间场景。玩家通过实地探索、搜证与数字交互逐步理解故事，使文化内容不再只是被观看，而是在行动中被发现。</p></div>`);
    appendEditorial("Interaction Design", "交互设计", `
      <div class="bilingual-pair"><p lang="en">The physical village and virtual scenes form a connected experience space. Players search for clues across real locations and enter Quest VR environments developed in Unity at selected narrative points. At the Pan King altar, players raise a torch using gesture and grip detection, revealing narrative information through bodily movement and changing viewpoints.</p><p class="case-cn" lang="zh-CN">真实村落与虚拟场景共同构成体验空间。玩家在不同地点寻找线索，并在特定节点进入 Unity 构建的 Quest VR 场景。在盘王祭坛中，玩家通过手势与抓握识别举起火把，随着身体移动和视角变化逐步发现空间中的叙事信息。</p></div>`);
    appendEditorial("Design Focus", "设计重点", `
      <div class="bilingual-pair"><p lang="en">The project is less concerned with digitizing as much cultural material as possible than with deciding <strong>how that material is encountered</strong>. The design shifts cultural content from static presentation toward something gradually understood through action:</p><p class="case-cn" lang="zh-CN">这个项目关注的并不是如何把更多文化资料“数字化”，而是如何决定这些资料<strong>以什么方式被遇见</strong>。我更关心的是把文化内容从静态展示转变为一个需要行动才能逐渐理解的过程：</p></div>
      <div class="bilingual-pair"><p class="case-flow" lang="en">Cultural material → Spatial clue → Bodily action → Digital response → Narrative understanding</p><p class="case-cn case-flow" lang="zh-CN">文化材料 → 空间线索 → 身体行动 → 数字反馈 → 叙事理解</p></div>
      <div class="bilingual-pair"><p lang="en">Physical space and VR therefore function not as separate media, but as different information layers within the same experience.</p><p class="case-cn" lang="zh-CN">实景与 VR 在这里并不是两个独立媒介，而是同一体验中的不同信息层。</p></div>`);
    appendEditorial("Takeaway", "项目反思", `
      <div class="bilingual-pair"><p lang="en">The Forbidden Hue led me to think about digitization of cultural heritage as more than reproducing physical content on a screen or inside VR. A more important question is <strong>how interaction changes the process through which people encounter, search for, and make sense of cultural information.</strong> When space, bodily action, and digital media participate in the narrative together, heritage becomes less an object to observe and more an experience assembled through exploration.</p><p class="case-cn" lang="zh-CN">《五色缚》让我开始思考，文化遗产的数字化并不一定意味着把现实内容复制进屏幕或 VR。更重要的问题可能是：<strong>交互如何改变一个人接触、寻找和理解文化信息的过程。</strong>当空间、身体行动和数字媒介共同参与叙事时，文化内容不再只是被观看的对象，而成为一个需要通过探索逐渐建立起来的经验。</p></div>`);
  }
  if (p.title === "Plantiever’s Illusion") {
    appendEditorial("Overview", "项目概述", `
      <div class="bilingual-pair"><p lang="en">In Chinese visual culture, the pine tree is commonly associated with longevity, endurance, blessing, and moral constancy. Through repetition, these associations can become so familiar that they begin to feel natural and self-evident. Plantiever’s Illusion begins with this familiarity. It places pine imagery alongside human bodies, turtles, braided hair, water, and enclosed spaces, using staged performance, superimposition, repeated framing, slowed pacing, and sound to alter the conditions under which the symbol is encountered. Rather than erasing the pine tree’s inherited meaning, the work keeps it recognizable while making its interpretation less stable.</p><p class="case-cn" lang="zh-CN">在中国视觉文化中，松树常与长寿、坚韧、祝福和品格联系在一起。随着这些象征不断被重复，它们也逐渐变得熟悉而稳定，以至于我们很少再意识到自己是如何理解它们的。Plantiever’s Illusion 从这种“过度熟悉”出发，将松树与人体、乌龟、辫发、水和封闭空间重新并置。通过表演影像、叠化、重复构图、缓慢节奏与声音，作品不试图消除松树原有的文化含义，而是改变它被观看和感知的条件。熟悉的吉祥符号因此仍然可以被辨认，却不再只能指向一个稳定的答案。</p></div>`);
    appendEditorial("Core Question", "核心问题", `
      <div class="bilingual-pair poop-question"><p lang="en">How can a digitally mediated moving-image installation support viewers in reflecting on and reinterpreting familiar cultural symbols?</p><p class="case-cn" lang="zh-CN">数字媒介化的动态影像装置如何支持观众反思并重新诠释熟悉的文化符号？</p></div>`);
    appendEditorial("Takeaway", "项目反思", `
      <div class="bilingual-pair"><p lang="en">This project led me to think about design not only as a way of creating new symbols, but also as a way of changing how existing ones are encountered. Reinterpretation does not always require supplying a new meaning. Sometimes it begins by <strong>slowing down a meaning that has become too automatic.</strong></p><p class="case-cn" lang="zh-CN">这个项目让我开始关注：设计不一定需要创造新的符号，也可以改变我们与既有符号相遇的方式。有时，重新解释并不来自提供一个新的答案，而来自<strong>延缓一个原本过于迅速的答案</strong>。</p></div>`);
  }
  if (p.title === "Closet X") {
    appendEditorial("Key Design Decision", "关键交互决策", `
      <div class="bilingual-pair"><p lang="en">The initial smart-mirror concept relied on touchscreen controls, but this created several problems in use: people would need to repeatedly move toward and away from the mirror, controls placed too high or low could be difficult to reach, and frequent touching would leave fingerprints on the reflective surface. We therefore moved the core interaction to <strong>gesture control</strong>. Users can browse and make selections while remaining at a natural viewing distance, allowing the interface to adapt to the body's position in front of the mirror rather than requiring the body to continually adapt to the screen.</p><p class="case-cn" lang="zh-CN">最初的方案考虑使用触摸屏控制智能试衣镜，但真实使用场景暴露出了明显的问题：用户需要反复靠近和远离镜面，较高或较低的按钮不容易触及，同时触摸也容易在镜面留下指纹。因此，我们最终将核心操作改为<strong>手势交互</strong>。用户可以保持正常试衣距离完成浏览与选择，让交互方式适应镜子前的身体位置，而不是要求身体不断适应屏幕。</p></div>`);
    appendOutcome();
  }
  if (p.title === "Navigating the Past") {
    appendEditorial("Interaction System", "交互系统", `
      <div class="bilingual-pair"><p lang="en">The project organizes the digital experience of the historic district through three connected spatial interfaces: <strong>path guidance, light-based boundary installations, and AR landmark interaction</strong>. A WeChat Mini Program supports navigation and information access, while real-time visual recognition identifies historic landmarks and location-based triggers connect digital content with the user's position. The interface therefore extends beyond the phone screen, operating together with streets, buildings, and the visitor's physical movement through the district.</p><p class="case-cn" lang="zh-CN">项目将历史街区的数字体验拆分为三个相互连接的空间界面：<strong>路径引导、边界光影装置与地标 AR 交互</strong>。微信小程序负责导航与信息组织，实时视觉识别用于识别历史地标，位置联动则根据用户所在位置触发对应内容。数字界面因此不只存在于手机屏幕中，而是与街道、建筑和人的实际移动共同构成导览过程。</p></div>`);
    appendOutcome();
  }
  if (p.title === "Fetorium") {
    appendEditorial("Overview", "项目概述", `
      <div class="bilingual-pair"><p lang="en">Fetorium is an interactive installation and experimental media artwork with no physical odor. Participants view odor-associated but odorless visual material while a hidden camera captures changes in their facial expression. MediaPipe reads shifts in facial-landmark positions and sends those changes into TouchDesigner as real-time interaction input.</p><p class="case-cn" lang="zh-CN">Fetorium 是一个没有真实气味的交互装置与实验媒体艺术作品。参与者观看与“臭味”相关、但实际上无气味的视觉内容；隐藏摄像头捕捉他们的面部变化，MediaPipe 读取五官关键点的位置变化，并将表情变化作为实时交互输入发送至 TouchDesigner。</p></div>`);
    appendEditorial("Core Question", "核心问题", `
      <div class="bilingual-pair poop-question"><p lang="en">Why do we perceive something as “smelly” even when no odor is physically present?</p><p class="case-cn" lang="zh-CN">当气味并不存在时，我们为什么仍然会觉得某些东西“很臭”？</p></div>`);
    appendEditorial("Interaction Logic", "交互逻辑", `
      <div class="bilingual-pair"><p class="case-flow" lang="en">Odor-associated visual stimulus → Facial reaction → Camera → MediaPipe facial landmarks → TouchDesigner → Odor Seed expansion / turbulence</p><p class="case-cn case-flow" lang="zh-CN">气味关联视觉刺激 → 面部反应 → 摄像头 → MediaPipe 面部关键点 → TouchDesigner → Odor Seed 膨胀 / 躁动</p></div>
      <div class="bilingual-pair"><p lang="en">When participants show visible disgust or discomfort, the Odor Seed expands and moves with greater turbulence. It does not simulate a real smell; it visualizes subjective perception and bodily reaction.</p><p class="case-cn" lang="zh-CN">当参与者出现明显的厌恶或不适表情时，Odor Seed 会膨胀，并产生更剧烈、更躁动的运动状态。它并非模拟真实气味，而是把人的主观感知与身体反应可视化。</p></div>`);
    appendEditorial("Puppet Logic", "木偶设计逻辑", `
      <div class="bilingual-pair"><p lang="en">A puppet can move only when manipulated by an external force. In Fetorium, this becomes a model for how judgments of “stench” can be shaped by inherited associations, social labels, and prejudice rather than direct sensory evidence.</p><p class="case-cn" lang="zh-CN">木偶只能在外力操纵下行动。在 Fetorium 中，这一逻辑对应人如何受到关于“臭”的既有联想、社会标签与偏见影响，而不只是依据直接的感官证据作出判断。</p></div>`);
    appendEditorial("Research Context", "研究背景", `
      <div class="bilingual-pair"><p lang="en">The project began with a childhood encounter with stink bugs and developed through exploratory interviews. Interviewees reported odor stereotypes and social associations attached to particular bodies, occupations, identities, or cultures. These accounts are treated as evidence of socially learned associations, not as objective descriptions of any group.</p><p class="case-cn" lang="zh-CN">项目源于童年时期对臭虫的经历，并通过探索性访谈继续发展。受访者讲述了与特定身体、职业、身份或文化相关的气味刻板印象与社会联想。项目将这些内容理解为社会习得的联想，而不是对任何群体“客观上很臭”的描述。</p></div>`);
    appendEditorial("System Prototype", "系统原型", `
      <div class="poop-system-grid"><article><h4>Camera</h4><p>Captures facial changes without introducing physical odor.</p><p class="case-cn">在没有真实气味的环境中捕捉面部变化。</p></article><article><h4>MediaPipe</h4><p>Reads changes in facial-landmark positions as interaction input.</p><p class="case-cn">读取面部关键点的位置变化并转化为交互输入。</p></article><article><h4>TouchDesigner</h4><p>Transforms facial reactions into Odor Seed expansion and turbulence.</p><p class="case-cn">将面部反应转化为 Odor Seed 的膨胀与躁动。</p></article><article><h4>Projection</h4><p>Returns the changing Odor Seed to the installation space in real time.</p><p class="case-cn">把变化中的 Odor Seed 实时投射回装置空间。</p></article></div>`);
  }
  if (p.title === "VIVID") {
    appendEditorial("Overview", "项目概述", `
      <div class="bilingual-pair"><p lang="en">Vivid is a generative-AI-assisted community memory prototype developed from interviews with approximately <strong>8–10 first-generation residents of Binjiang New Village</strong>. It combines map-based memory nodes, spoken descriptions, and editable AI-generated images. Generated images are treated as prompts for review rather than reconstructions of the past: residents can identify mismatches, add missing details, and continue narrating memories prompted by what they see.</p><p class="case-cn" lang="zh-CN">Vivid 是一个生成式 AI 辅助的社区记忆交互原型，基于对滨江新村约 <strong>8–10 位第一代居民</strong>的访谈展开。平台结合社区地图、居民口述与可编辑的 AI 生成图像。图像不被视为对过去的复原，而是供居民观看、判断与修正的对象；居民可以指出不符合记忆的地方、补充遗漏细节，并继续讲述由图像唤起的内容。</p></div>`);
    appendEditorial("Research Question", "研究问题", `
      <div class="bilingual-pair poop-question"><p lang="en">How can editable AI-generated images support residents in supplementing, correcting, and negotiating place-based memories?</p><p class="case-cn" lang="zh-CN">可编辑的 AI 生成图像如何支持居民补充、修正和协商社区空间记忆？</p></div>`);
    appendEditorial("Interaction Flow", "交互流程", `
      <div class="bilingual-pair"><p class="case-flow" lang="en">Map Node → Spoken Memory → AI Image → Review &amp; Correction → Further Recollection → Revised Version</p><p class="case-cn case-flow" lang="zh-CN">地图地点 → 口述记忆 → AI 图像 → 观看与修正 → 补充记忆 → 新版本</p></div>
      <div class="poop-strategy-grid"><article><h4>1. Locate <small>找到地点</small></h4><p>Residents select a place associated with a memory from the community map.</p><p class="case-cn">居民从社区地图中选择一个与记忆相关的地点。</p></article><article><h4>2. Tell <small>讲述</small></h4><p>They describe remembered spaces, people, activities, and details through speech.</p><p class="case-cn">通过语音描述记忆中的空间、人物、活动和细节。</p></article><article><h4>3. Visualise <small>可视化</small></h4><p>The system turns the account into an image for review and discussion.</p><p class="case-cn">系统根据口述内容生成一张可供讨论的图像。</p></article><article><h4>4. Correct <small>修正</small></h4><p>Residents identify elements that do not match what they remember.</p><p class="case-cn">居民指出图像中不符合自己记忆的内容。</p></article><article><h4>5. Remember Again <small>再次回忆</small></h4><p>Reviewing the image may prompt details omitted from the initial account.</p><p class="case-cn">观看和纠错可能引出此前没有讲出的细节和故事。</p></article><article><h4>6. Revise <small>更新</small></h4><p>Corrections inform a new version while earlier versions remain traceable.</p><p class="case-cn">新的描述与修正进入下一版本，原有版本继续保留。</p></article></div>`);
    appendEditorial("From Image Generation to Memory Interaction", "从生成图像到记忆交互", `
      <div class="bilingual-pair"><p lang="en">Vivid does not treat image generation as the end of the interaction. The more important questions begin after the image appears: <strong>What feels wrong? What is missing? What did the image make you remember?</strong> AI acts as a mediating representation that externalises a memory so residents can inspect, question, and revise it.</p><p class="case-cn" lang="zh-CN">Vivid 并不把“生成一张图片”作为交互终点。更重要的交互发生在图像出现之后：<strong>哪里不对？还缺了什么？这张图又让你想起了什么？</strong> AI 主要承担中介作用，把难以完全通过语言表达的空间记忆暂时外化，让居民拥有一个可以观看、判断和修改的对象。</p></div>`);
    appendEditorial("Multiple Memories", "多人记忆", `
      <div class="bilingual-pair"><p lang="en">The same place may be remembered differently by different residents. The next stage will examine how residents supplement one another's accounts, identify differences, and negotiate what should be preserved. The aim is not a single “correct” version, but an understanding of how shared memories emerge and where differences remain.</p><p class="case-cn" lang="zh-CN">同一个地点可能被不同居民以不同方式记住。下一阶段将观察多位居民如何补充彼此的记忆、指出差异，并协商哪些内容应该被共同保存。目标不是产生唯一的“正确版本”，而是理解共享记忆如何形成，又在哪里保持差异。</p></div>`);
    appendEditorial("Current Stage", "当前阶段", `
      <div class="bilingual-pair"><p lang="en"><strong>Completed:</strong> interviews with approximately 8–10 first-generation residents; initial analysis of place-based memory accounts; a map-based memory interface; voice input; and an editable AI-generated image prototype.</p><p class="case-cn" lang="zh-CN"><strong>已完成：</strong>约 8–10 位第一代居民访谈、社区空间记忆初步分析、地图式记忆界面、语音输入，以及可编辑的 AI 生成图像原型。</p></div>
      <div class="bilingual-pair"><p lang="en"><strong>Next:</strong> user studies examining how residents supplement memories, correct generated representations, and negotiate shared memories.</p><p class="case-cn" lang="zh-CN"><strong>下一步：</strong>开展用户研究，观察居民如何补充记忆、修正生成表征并协商共享记忆。</p></div>`);
    appendEditorial("Research Direction", "后续研究方向", `
      <div class="bilingual-pair"><p lang="en">The next stage asks how tangible or embodied interaction might deepen participation in digital memory experiences without distracting from the memories residents are trying to express.</p><p class="case-cn" lang="zh-CN">下一阶段将研究：当记忆交互从屏幕上的点击和修改扩展到 tangible 或 embodied interaction 时，是否能增强居民的参与和表达，同时避免交互本身分散对记忆内容的注意。</p></div>`);
  }
  if (p.title === "Value Machine") {
    appendEditorial("Core Question", "核心问题", `
      <div class="bilingual-pair poop-question"><p lang="en">When does our judgment of an artwork become a judgment of the name attached to it?</p><p class="case-cn" lang="zh-CN">我们是在评价一件作品，还是在评价附着在作品上的名字？</p></div>`);
    appendEditorial("Participatory Mechanism", "参与机制", `
      <div class="bilingual-pair"><p lang="en">Value Machine constructs an exhibition and auction around a fictional high-profile artist. Participants first generate images through an interactive installation without knowing what will happen to them next. These images are then reframed, exhibited, and auctioned under the fictional artist's name.</p><p class="case-cn" lang="zh-CN">Value Machine 围绕一个虚构的知名艺术家构建了一套完整的展览与拍卖机制。参与者首先通过互动装置生成图像，却不知道这些图像之后会发生什么。作品随后被重新包装，以虚构艺术家的名义进入展览，并进一步参与拍卖。</p></div>
      <div class="bilingual-pair"><p lang="en">Once audiences believe that the works belong to an established artist, they begin to reassess and bid on them—including, in some cases, images that they themselves had previously produced. The final reveal destabilizes the relationship between creation, authorship, reputation, and perceived value.</p><p class="case-cn" lang="zh-CN">当观众相信这些作品出自一位具有声望的艺术家时，他们开始重新评价并为这些作品竞价——其中甚至包括他们自己此前生成的内容。最终的揭示让创作、作者身份与市场价值之间的关系重新变得不稳定。</p></div>
      <div class="bilingual-pair"><p class="case-flow" lang="en">Create → Reframe → Exhibit → Bid → Reveal</p><p class="case-cn case-flow" lang="zh-CN">创作 → 重构语境 → 展览 → 竞价 → 揭示</p></div>`);
  }
  if (p.title === "Plantiever’s Illusion") {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="plantiever-storyboard">
        <header><span>${String(sectionNumber).padStart(2, "0")}</span><div><h3>Video Storyboard</h3><p>视频分镜图 · Narrative development</p></div></header>
        <figure><img data-src="assets/projects/plantievers-illusion/process/video-storyboard.webp" alt="Plantiever’s Illusion video storyboard showing two storylines and their combination" loading="lazy" decoding="async"></figure>
      </section>`,
    );
    sectionNumber += 1;
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="poop-research plantiever-research">
        <header><span>${String(sectionNumber).padStart(2, "0")}</span><div><h3>Research & Conference Presentation</h3><p>论文与会议展示</p></div></header>
        <div class="poop-paper-grid plantiever-paper-grid">
          <article class="poop-paper-card--cc plantiever-paper-card--cc">
            <div class="poop-paper-media">
              <img class="poop-paper-media-image is-active" data-src="assets/projects/plantievers-illusion/research/creativity-cognition-poster.webp" alt="ACM Creativity and Cognition 2026 poster for Unsettling the Auspicious Pine" loading="lazy" decoding="async">
              <img class="poop-paper-media-image" data-src="assets/projects/plantievers-illusion/research/creativity-cognition-photo.webp" alt="Unsettling the Auspicious Pine presented at ACM Creativity and Cognition 2026" loading="lazy" decoding="async">
              <span class="poop-paper-count">01 / 02</span>
              <button class="poop-paper-arrow" type="button" aria-label="Show C&amp;C presentation documentation"><span>→</span></button>
            </div>
            <div class="poop-paper-copy"><h4>ACM Creativity &amp; Cognition 2026</h4><p>Unsettling the Auspicious Pine: A Digitally Mediated Moving-Image Installation for Reflective Reinterpretation</p><a href="https://scholar.google.com/citations?view_op=view_citation&amp;hl=en&amp;user=yYgrzP8AAAAJ&amp;citation_for_view=yYgrzP8AAAAJ:u5HHmVD_uO8C" target="_blank" rel="noreferrer">Google Scholar / 查看论文 ↗</a></div>
          </article>
        </div>
      </section>`,
    );
    const plantieverCcCard = container.querySelector(".plantiever-paper-card--cc");
    const plantieverCcImages = [...plantieverCcCard.querySelectorAll(".poop-paper-media-image")];
    const plantieverCcArrow = plantieverCcCard.querySelector(".poop-paper-arrow");
    const plantieverCcCount = plantieverCcCard.querySelector(".poop-paper-count");
    let plantieverCcIndex = 0;
    plantieverCcArrow.onclick = () => {
      plantieverCcIndex = (plantieverCcIndex + 1) % plantieverCcImages.length;
      plantieverCcImages.forEach((image, index) =>
        image.classList.toggle("is-active", index === plantieverCcIndex),
      );
      plantieverCcArrow.setAttribute(
        "aria-label",
        plantieverCcIndex === 0
          ? "Show C&C presentation documentation"
          : "Show the Unsettling the Auspicious Pine poster",
      );
      plantieverCcCount.textContent = `${String(plantieverCcIndex + 1).padStart(2, "0")} / 02`;
    };
    sectionNumber += 1;
  }
  if (p.title === "Value Machine") {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="plantiever-gallery value-machine-gallery" aria-label="Value Machine final outcome gallery">
        <div class="plantiever-gallery-stage">
          <figure class="plantiever-gallery-peek plantiever-gallery-peek--prev"><img alt="Previous Value Machine outcome"></figure>
          <figure class="plantiever-gallery-main"><img alt="Value Machine final outcome 1 of ${valueMachineOutcomeGallery.length}" loading="eager"></figure>
          <figure class="plantiever-gallery-peek plantiever-gallery-peek--next"><img alt="Next Value Machine outcome"></figure>
        </div>
        <footer class="plantiever-gallery-footer">
          <div class="plantiever-gallery-caption"><p>Value Machine — Final outcome</p><span>Image 01 / ${String(valueMachineOutcomeGallery.length).padStart(2, "0")}</span></div>
          <div class="plantiever-gallery-controls">
            <button type="button" data-value-direction="-1" aria-label="Previous image">←</button>
            <button type="button" data-value-direction="1" aria-label="Next image">→</button>
          </div>
        </footer>
      </section>`,
    );
    let valueGalleryIndex = 0;
    const valueGallery = container.querySelector(".value-machine-gallery");
    const valueMain = valueGallery.querySelector(".plantiever-gallery-main img");
    const valuePrevious = valueGallery.querySelector(".plantiever-gallery-peek--prev img");
    const valueNext = valueGallery.querySelector(".plantiever-gallery-peek--next img");
    const valueCounter = valueGallery.querySelector(".plantiever-gallery-caption span");
    const renderValueGallery = async () => {
      const previousIndex = (valueGalleryIndex - 1 + valueMachineOutcomeGallery.length) % valueMachineOutcomeGallery.length;
      const nextIndex = (valueGalleryIndex + 1) % valueMachineOutcomeGallery.length;
      await Promise.all([
        swapResponsiveImage(valueMain, valueMachineOutcomeGallery[valueGalleryIndex], "70vw"),
        swapResponsiveImage(valuePrevious, valueMachineOutcomeGallery[previousIndex], "25vw"),
        swapResponsiveImage(valueNext, valueMachineOutcomeGallery[nextIndex], "25vw"),
      ]);
      valueMain.alt = `Value Machine final outcome ${valueGalleryIndex + 1} of ${valueMachineOutcomeGallery.length}`;
      valueCounter.textContent = `Image ${String(valueGalleryIndex + 1).padStart(2, "0")} / ${String(valueMachineOutcomeGallery.length).padStart(2, "0")}`;
      preloadResponsiveImage(valueMachineOutcomeGallery[nextIndex], "70vw");
      preloadResponsiveImage(valueMachineOutcomeGallery[previousIndex], "70vw");
    };
    valueGallery.querySelectorAll("[data-value-direction]").forEach((button) => {
      button.onclick = async () => {
        valueGalleryIndex = (valueGalleryIndex + Number(button.dataset.valueDirection) + valueMachineOutcomeGallery.length) % valueMachineOutcomeGallery.length;
        valueGallery.classList.add("is-changing");
        await renderValueGallery();
        valueGallery.classList.remove("is-changing");
      };
    });
    let valuePointerStart = null;
    valueGallery.querySelector(".plantiever-gallery-stage").addEventListener("pointerdown", (event) => {
      valuePointerStart = event.clientX;
    });
    valueGallery.querySelector(".plantiever-gallery-stage").addEventListener("pointerup", (event) => {
      if (valuePointerStart === null || Math.abs(event.clientX - valuePointerStart) < 45) return;
      const direction = event.clientX < valuePointerStart ? 1 : -1;
      valueGallery.querySelector(`[data-value-direction="${direction}"]`).click();
      valuePointerStart = null;
    });
    renderValueGallery();
  }
  const selectedPortfolioSeries = portfolioSeries[p.title];
  if (selectedPortfolioSeries) {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="portfolio-series"><header><span>${String(sectionNumber).padStart(2, "0")}</span><div><h3>MA Application Portfolio Series</h3><p>硕士申请作品集系列套图 · Original full-resolution spreads</p></div><small>Drag or scroll horizontally / 左右滑动</small></header><div class="portfolio-rail">${selectedPortfolioSeries.map((src, i) => `<figure><img data-src="${src}" alt="${p.title} MA application portfolio spread ${i + 1}" loading="lazy"><figcaption>${String(i + 1).padStart(2, "0")} / ${String(selectedPortfolioSeries.length).padStart(2, "0")}</figcaption></figure>`).join("")}</div></section>`,
    );
    sectionNumber += 1;
  }
  if (publication && p.title !== "Plantiever’s Illusion") {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="case-section publication-section"><div class="case-label"><span>${String(sectionNumber).padStart(2, "0")}</span><h3>Publication<small>相关论文</small></h3></div><div class="case-body"><p>${publication.title}</p><p class="case-cn">${publication.meta}</p><a class="paper-link" href="${publication.url}" target="_blank" rel="noreferrer">Read the paper on Google Scholar / 查看论文 ↗</a></div></section>`,
    );
  }
}

function renderPoopSlaves() {
  const container = document.querySelector("#case-sections");
  const outcomes = [
    {
      image: "assets/projects/poopslaves/gallery/outcome-01.webp",
      title: "A speculative economy built around bodily extraction",
      copy: "The virtual environment turns repetitive bodily labour into a visible system of value, scarcity and unequal accumulation.",
      cn: "虚拟环境将重复的身体劳动转化为可见的价值、稀缺与不平等积累系统。",
    },
    {
      image: "assets/projects/poopslaves/gallery/outcome-02.webp",
      title: "Roles and hierarchies become visible through scale",
      copy: "PoopSlaves, PoopMasters and PoopDeities occupy the same world while receiving radically different agency and rewards.",
      cn: "PoopSlaves、PoopMasters 与 PoopDeities 共处同一世界，却拥有截然不同的能动性与回报。",
    },
    {
      image: "assets/projects/poopslaves/gallery/outcome-03.webp",
      title: "Scarcity is staged as a spatial system",
      copy: "Toilets, pipes and monumental bodies form an arena where extraction is not background logic but the architecture itself.",
      cn: "马桶、管道与巨型身体共同构成竞技场，使价值提取从后台规则变成空间本身。",
    },
    {
      image: "assets/projects/poopslaves/gallery/outcome-04.webp",
      title: "Sanitation becomes spectacle",
      copy: "The arena exaggerates consumption and excretion until bodily infrastructure reads as both absurd entertainment and coercive order.",
      cn: "场景放大消费与排泄，使身体基础设施同时呈现为荒诞娱乐与强制秩序。",
    },
    {
      image: "assets/projects/poopslaves/gallery/outcome-05.webp",
      title: "Cognitive friction interrupts seamless interaction",
      copy: "Delayed feedback and unstable rewards make the player question who controls the system and where the generated value travels.",
      cn: "延迟反馈与不稳定回报迫使玩家追问：谁控制系统，产生的价值最终流向何处？",
    },
  ];
  container.innerHTML = `
    <section class="poop-results">
      <header><span>01</span><div><h3>Final Outcomes</h3><p>最终成果 · RCA homepage-style feature carousel</p></div></header>
      <div class="poop-rca-carousel" aria-label="PoopSlaves final outcomes">
        <button class="poop-rca-arrow poop-rca-arrow--prev" data-poop-direction="-1" aria-label="Previous outcome"><span>←</span></button>
        <figure class="poop-rca-slide" aria-live="polite">
          <img src="${outcomes[0].image}" alt="PoopSlaves final outcome 1 of ${outcomes.length}" loading="eager">
          <figcaption>
            <p class="poop-rca-kicker">FINAL OUTCOME <span>01 / ${String(outcomes.length).padStart(2, "0")}</span></p>
            <h4>${outcomes[0].title}</h4>
            <p class="poop-rca-copy">${outcomes[0].copy}</p>
            <p class="case-cn poop-rca-cn">${outcomes[0].cn}</p>
          </figcaption>
        </figure>
        <button class="poop-rca-arrow poop-rca-arrow--next" data-poop-direction="1" aria-label="Next outcome"><span>→</span></button>
        <div class="poop-rca-mobile-controls" aria-label="Outcome gallery controls">
          <button data-poop-direction="-1" aria-label="Previous outcome"><span>←</span></button>
          <button data-poop-direction="1" aria-label="Next outcome"><span>→</span></button>
        </div>
      </div>
    </section>
    <section class="poop-project-section">
      <header><span>02</span><div><h3>Overview</h3><p>项目概述</p></div></header>
      <div class="poop-project-copy">
        <p lang="en">PoopSlaves constructs a fictional physiological economy in which bodily waste becomes scarce because of its imagined use in medicine, energy, and identity authentication.</p>
        <p lang="zh-CN" class="case-cn">PoopSlaves 构建了一个虚构的生理经济：在这个世界中，排泄物因医疗、能源和身份认证等用途成为稀缺资源。</p>
        <p lang="en">Participants enter the system as producers. Their local actions continuously generate resources, but those resources do not remain under their control. The system redirects, evaluates, and accumulates what they produce, gradually revealing a separation between being able to act and being able to determine the consequences of that action.</p>
        <p lang="zh-CN" class="case-cn">参与者扮演系统中的生产者，通过局部操作不断产生资源。但这些产出并不真正属于生产者。系统会重新转移、估值并累积资源，使参与者逐渐意识到，能够采取行动并不意味着能够控制行动的结果。</p>
        <p lang="en">Rather than explaining bodily commodification, constructed scarcity, and unequal value extraction through narrative alone, the project turns these relationships into rules that participants can encounter through interaction.</p>
        <p lang="zh-CN" class="case-cn">项目以这种刻意设置的不对称关系为核心，将身体商品化、稀缺性制造和不平等价值抽取转化为可以被操作和感知的交互规则，而不是只通过叙事进行描述。</p>
      </div>
    </section>
    <section class="poop-project-section">
      <header><span>03</span><div><h3>Research Question</h3><p>研究问题</p></div></header>
      <div class="bilingual-pair poop-question"><p lang="en">What happens when participants can act within a system but cannot control the outcomes of their actions?</p><p class="case-cn" lang="zh-CN">当参与者能够行动，却无法控制行动的结果时，会发生什么？</p></div>
    </section>
    <section class="poop-project-section">
      <header><span>04</span><div><h3>Interaction Logic</h3><p>交互逻辑</p></div></header>
      <div class="poop-project-copy">
        <p lang="en">Participants begin with local production actions inside the Unreal Engine environment. The resulting resources are routed away and reappear in the TouchDesigner visualization as movement, shifts in value, and system-level accumulation.</p>
        <p lang="zh-CN" class="case-cn">参与者首先在 Unreal Engine 场景中执行局部的生产行为，并生成相应资源。这些资源随后被系统转移，并在 TouchDesigner 界面中以资源流动、价值变化形式重新出现。</p>
        <p lang="en">Participants can produce, trigger, and observe change, but they cannot recover the value they generate, redirect its valuation, or determine where it ultimately accumulates.</p>
        <p lang="zh-CN" class="case-cn">参与者可以生产、触发和观察变化，却无法取回已经产生的价值，也无法重新决定它的估值方式或最终累积的位置。</p>
        <p class="poop-flow" lang="en">Local action → Resource production → System transfer → Revaluation → Accumulation</p>
        <p class="case-cn poop-flow" lang="zh-CN">局部行动 → 资源产生 → 系统转移 → 价值重新分配 → 整体累积</p>
        <p lang="en">The interaction deliberately weakens the usual expectation that a user's input should lead to an outcome they can directly control.</p>
        <p lang="zh-CN" class="case-cn">这种反馈结构有意削弱了“我的输入必然对应我的结果”这一常见交互预期。</p>
      </div>
    </section>
    <section class="poop-project-section">
      <header><span>05</span><div><h3>Design Strategy</h3><p>设计策略</p></div></header>
      <div class="poop-strategy-grid">
        <article><h4>Temporal Friction <small>时间摩擦</small></h4><p lang="en">Delay, repetition, and waiting interrupt the impulse to immediately learn and optimize the system.</p><p class="case-cn" lang="zh-CN">通过等待、重复和延迟，打断玩家快速理解规则并优化操作的惯性。</p></article>
        <article><h4>Feedback Decoupling <small>反馈解耦</small></h4><p lang="en">Actions produce visible feedback without giving participants direct control over the final outcome.</p><p class="case-cn" lang="zh-CN">参与者的行为会产生反馈，但行为与最终结果之间不存在直接的一一对应关系。</p></article>
        <article><h4>Scale Asymmetry <small>尺度不对称</small></h4><p lang="en">Small bodily actions feed into a much larger process of accumulation, creating an asymmetry between individual action and systemic consequence.</p><p class="case-cn" lang="zh-CN">微小、局部的身体行为不断进入更大的资源累积系统，使个人行动与系统结果之间形成明显的尺度差异。</p></article>
      </div>
    </section>
    <section class="poop-project-section">
      <header><span>06</span><div><h3>System Prototype</h3><p>系统原型</p></div></header>
      <div class="poop-system-grid">
        <article><h4>Unreal Engine 5</h4><p lang="en">Builds the real-time 3D environment, spatial hierarchy, character behavior, and event triggers.</p><p class="case-cn" lang="zh-CN">构建实时 3D 世界、空间层级、角色行为以及事件触发机制。</p></article>
        <article><h4>TouchDesigner</h4><p lang="en">Visualizes resource movement, changing values, and accumulation across the system in real time.</p><p class="case-cn" lang="zh-CN">实时呈现资源移动、价值变化以及不同层级中的资源累积。</p></article>
        <article><h4>OSC</h4><p lang="en">Synchronizes interaction events in Unreal Engine with data-state changes in TouchDesigner.</p><p class="case-cn" lang="zh-CN">同步 Unreal Engine 中发生的交互事件与 TouchDesigner 中的数据状态变化。</p></article>
        <article><h4>Blender</h4><p lang="en">Used for character modeling, sculpting, and visual worldbuilding.</p><p class="case-cn" lang="zh-CN">用于角色建模、造型和视觉世界构建。</p></article>
      </div>
    </section>
    <section class="poop-project-section">
      <header><span>07</span><div><h3>Preliminary Observations</h3><p>初步观察 · Early demonstrations</p></div></header>
      <div class="poop-project-copy">
        <p lang="en">During early demonstrations, some participants initially approached PoopSlaves as a system to be learned and optimized. As interaction continued, they began to recognize that becoming more effective at local actions did not give them greater control over the system as a whole. Doing more and determining what happens next became two different forms of agency.</p>
        <p class="case-cn" lang="zh-CN">在早期展示中，一些参与者最初会把 PoopSlaves 当作一个可以被学习和优化的游戏系统。随着交互继续，他们开始发现：提高局部操作效率并不会带来对整个系统的控制。能够“做更多”与能够决定“结果如何发生”是两件不同的事情。</p>
        <p lang="en">The grotesque visual language also worked more clearly when it was tied to role functions, spatial hierarchy, and accumulation rules rather than used as spectacle on its own.</p>
        <p class="case-cn" lang="zh-CN">同时，夸张和怪诞的视觉元素在与角色职能、空间层级以及资源累积规则直接对应时，比单纯作为视觉冲击出现更有效。</p>
      </div>
    </section>
    <section class="poop-research">
      <header><span>08</span><div><h3>Research & Conference Presentations</h3><p>论文与会议展示</p></div></header>
      <div class="bilingual-pair"><p class="poop-method" lang="en">Successive VR prototypes tested how unequal rules, delayed feedback and constrained movement could make bodily commodification felt rather than merely described.</p><p class="case-cn" lang="zh">通过多轮 VR 原型，测试不平等规则、延迟反馈与受限行动如何让身体商品化成为可感的体验，而不只是文字描述。</p></div>
      <div class="poop-paper-grid">
        <article><img data-src="assets/projects/poopslaves/research/hcii-poster.webp" alt="HCII poster for Visceral Interaction" loading="lazy"><div class="poop-paper-copy"><h4>HCII 2026 · Late Breaking Work</h4><p>Visceral Interaction: Operationalizing Cognitive Friction through Rule-Based VR Economic Simulation</p><a href="https://scholar.google.com/scholar?q=Visceral+Interaction+Operationalizing+Cognitive+Friction+through+Rule-Based+VR+Economic+Simulation" target="_blank" rel="noreferrer">Paper record / 论文链接 ↗</a></div></article>
        <article class="poop-paper-card--cc">
          <div class="poop-paper-media">
            <img class="poop-paper-media-image is-active" data-src="assets/projects/poopslaves/research/creativity-cognition-poster.webp" alt="Creativity and Cognition poster for Excremental Economy" loading="lazy" decoding="async">
            <img class="poop-paper-media-image" data-src="assets/projects/poopslaves/research/creativity-cognition-photo.webp" alt="PoopSlaves poster presented at Creativity and Cognition" loading="lazy" decoding="async">
            <span class="poop-paper-count">01 / 02</span>
            <button class="poop-paper-arrow" type="button" aria-label="Show C&amp;C presentation documentation"><span>→</span></button>
          </div>
          <div class="poop-paper-copy"><h4>ACM Creativity & Cognition 2026</h4><p>Excremental Economy: A Rule-Based Speculative System for Staging Bodily Commodification and Unequal Value Extraction</p><a href="https://scholar.google.com/citations?view_op=view_citation&hl=en&user=yYgrzP8AAAAJ&citation_for_view=yYgrzP8AAAAJ:u-x6o8ySG0sC" target="_blank" rel="noreferrer">Google Scholar / 查看论文 ↗</a></div>
        </article>
      </div>
    </section>
    <section class="poop-graduation">
      <header><span>09</span><div><h3>HIT Outstanding Graduation Project</h3><p>哈尔滨工业大学优秀毕业设计</p></div></header>
      <div class="bilingual-pair"><p class="poop-graduation-lead" lang="en">PoopSlaves was presented as Yutong Chen's undergraduate graduation project at Harbin Institute of Technology and received recognition as an Outstanding Graduation Project.</p><p class="case-cn" lang="zh">PoopSlaves 作为陈宇同在哈尔滨工业大学的本科毕业设计进行展出，并获评优秀毕业设计。</p></div>
      <div class="poop-honour-grid">
        <figure><img data-src="assets/projects/poopslaves/research/graduation-display.webp" alt="PoopSlaves undergraduate graduation exhibition display" loading="lazy"><figcaption>Graduation exhibition / 本科毕业设计陈列</figcaption></figure>
        <figure><img data-src="assets/projects/poopslaves/research/graduation-documentation.webp" alt="Graduation exhibition documentation" loading="lazy"><figcaption>Exhibition documentation / 毕设展现场记录</figcaption></figure>
        <figure><img data-src="assets/projects/poopslaves/research/graduation-certificate.webp" alt="Outstanding Graduation Project certificate" loading="lazy"><figcaption>Outstanding Graduation Project certificate / 优秀毕业设计证书</figcaption></figure>
      </div>
    </section>
    <section class="portfolio-series"><header><span>10</span><div><h3>MA Application Portfolio Series</h3><p>硕士申请作品集系列套图 · Original full-resolution spreads</p></div><small>Drag or scroll horizontally / 左右滑动</small></header><div class="portfolio-rail">${poopPortfolioSeries.map((src, i) => `<figure><img data-src="${src}" alt="PoopSlaves MA application portfolio spread ${i + 1}" loading="lazy"><figcaption>${String(i + 1).padStart(2, "0")} / ${String(poopPortfolioSeries.length).padStart(2, "0")}</figcaption></figure>`).join("")}</div></section>`;
  const hero = document.querySelector(".case-hero");
  hero.style.backgroundImage = `linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.12)),url('${media("assets/projects/poopslaves/cover/cover.webp")}')`;
  let outcomeIndex = 0;
  const slide = container.querySelector(".poop-rca-slide");
  preloadResponsiveImage(outcomes[1].image, "100vw");
  const updateOutcome = (direction) => {
    outcomeIndex = (outcomeIndex + direction + outcomes.length) % outcomes.length;
    const outcome = outcomes[outcomeIndex];
    slide.classList.add("is-changing");
    setTimeout(async () => {
      const image = slide.querySelector("img");
      await swapResponsiveImage(image, outcome.image, "100vw");
      image.alt = `PoopSlaves final outcome ${outcomeIndex + 1} of ${outcomes.length}`;
      slide.querySelector(".poop-rca-kicker span").textContent = `${String(outcomeIndex + 1).padStart(2, "0")} / ${String(outcomes.length).padStart(2, "0")}`;
      slide.querySelector("h4").textContent = outcome.title;
      slide.querySelector(".poop-rca-copy").textContent = outcome.copy;
      slide.querySelector(".poop-rca-cn").textContent = outcome.cn;
      preloadResponsiveImage(outcomes[(outcomeIndex + 1) % outcomes.length].image, "100vw");
      slide.classList.remove("is-changing");
    }, 180);
  };
  container.querySelectorAll("[data-poop-direction]").forEach((button) => {
    button.onclick = () => {
      updateOutcome(Number(button.dataset.poopDirection));
    };
  });
  let poopSwipeStart = null;
  slide.addEventListener("pointerdown", (event) => {
    poopSwipeStart = { x: event.clientX, y: event.clientY };
  });
  slide.addEventListener("pointerup", (event) => {
    if (!poopSwipeStart) return;
    const dx = event.clientX - poopSwipeStart.x;
    const dy = event.clientY - poopSwipeStart.y;
    poopSwipeStart = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
    updateOutcome(dx < 0 ? 1 : -1);
  });
  slide.addEventListener("pointercancel", () => (poopSwipeStart = null));
  let ccSlideIndex = 0;
  const ccCard = container.querySelector(".poop-paper-card--cc");
  const ccImages = [...ccCard.querySelectorAll(".poop-paper-media-image")];
  const ccArrow = ccCard.querySelector(".poop-paper-arrow");
  const ccCount = ccCard.querySelector(".poop-paper-count");
  ccArrow.onclick = () => {
    ccSlideIndex = (ccSlideIndex + 1) % ccImages.length;
    ccImages.forEach((image, index) =>
      image.classList.toggle("is-active", index === ccSlideIndex),
    );
    ccArrow.setAttribute(
      "aria-label",
      ccSlideIndex === 0
        ? "Show C&C presentation documentation"
        : "Show the Excremental Economy poster",
    );
    ccCount.textContent = `${String(ccSlideIndex + 1).padStart(2, "0")} / 02`;
  };
}
const projectSlug = (title) =>
  title
    .normalize("NFKD")
    .replace(/[\u2018\u2019']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const setProjectRoute = (index = current, replace = false) => {
  const url = new URL(location.href);
  url.hash = `project/${projectSlug(projects[index].title)}`;
  const state = { project: index, portfolioDetail: true };
  history[replace ? "replaceState" : "pushState"](state, "", url);
};
const clearProjectRoute = () => {
  if (!location.hash.startsWith("#project/")) return;
  history.replaceState({}, "", `${location.pathname}${location.search}`);
};
function enhancePortfolioRails() {
  note.querySelectorAll(".portfolio-rail").forEach((rail) => {
    rail.tabIndex = 0;
    rail.setAttribute("aria-label", "Project portfolio images. Use left and right arrow keys to browse.");
    rail.onkeydown = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      rail.scrollBy({
        left: (event.key === "ArrowRight" ? 1 : -1) * rail.clientWidth * 0.85,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    };
  });
}
function openNote(updateRoute = true) {
  if (!note.classList.contains("open")) overlayOpener = document.activeElement;
  document.body.classList.add("detail-open");
  note.classList.add("open");
  note.setAttribute("aria-hidden", "false");
  note.scrollTo(0, 0);
  fillNote();
  enhancePortfolioRails();
  registerMedia(note);
  syncInteractiveState();
  note.focus({ preventScroll: true });
  document.title = `${projects[current].title} — Yutong Chen`;
  document.querySelector('meta[name="description"]').content = projects[current].copy;
  if (updateRoute) setProjectRoute();
}
function closeNote(restore = true, updateRoute = true) {
  const categoryToRestore = returnCategory;
  returnCategory = null;
  const panelToRestore = restore && !categoryToRestore ? detailOriginPanel : null;
  if (restore) detailOriginPanel = null;
  note.classList.remove("open");
  document.body.classList.remove("detail-open");
  note.setAttribute("aria-hidden", "true");
  document.title = "Yutong Chen — Portfolio";
  document.querySelector('meta[name="description"]').content = "Yutong Chen is an HCI researcher and creative technologist exploring creativity and cognition, human–AI interaction, embodied interaction and generative systems.";
  syncInteractiveState();
  if (restore && overlayOpener?.isConnected) overlayOpener.focus();
  if (updateRoute) {
    if (history.state?.portfolioDetail) {
      suppressNextRouteRestore = Boolean(categoryToRestore);
      history.back();
    }
    else clearProjectRoute();
  }
  if (restore && categoryToRestore) openCategory(categoryToRestore);
  else if (restore && panelToRestore) {
    const panel = document.querySelector(`[data-panel="${panelToRestore.name}"]`);
    panel?.classList.add("open");
    if (panel) {
      panel.scrollTop = panelToRestore.scrollTop;
      syncInteractiveState();
      panel.querySelector("[data-close]")?.focus();
    }
  }
}
document.querySelector("#read-project").onclick = () => {
  if (projects[current].title === "VIVID") window.open(VIVID_PLATFORM_URL, "_blank", "noopener,noreferrer");
  else openNote();
};
document.querySelector("#close-note").onclick = closeNote;
let noteSwipeStart = null;
note.addEventListener("pointerdown", (event) => {
  if (!matchMedia("(pointer:coarse)").matches || event.target.closest("button,a,.portfolio-rail,.plantiever-gallery")) return;
  noteSwipeStart = { x: event.clientX, y: event.clientY };
});
note.addEventListener("pointerup", (event) => {
  if (!noteSwipeStart) return;
  const dx = event.clientX - noteSwipeStart.x;
  const dy = event.clientY - noteSwipeStart.y;
  noteSwipeStart = null;
  if (Math.abs(dx) < 64 || Math.abs(dx) <= Math.abs(dy)) return;
  navigateNote(dx < 0 ? 1 : -1);
});
note.addEventListener("pointercancel", () => (noteSwipeStart = null));
const cursor = document.querySelector(".cursor");
addEventListener("pointermove", (e) => {
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
  const px = e.clientX / innerWidth - 0.5,
    py = e.clientY / innerHeight - 0.5;
  if (currentView === "home") {
    mosaic.style.transform = `translate(${px * 15}px,${py * 12}px) rotateY(${px * 3}deg)`;
  } else
    image.style.transform = `scale(1.045) translate(${px * -1.1}%,${py * -1.1}%)`;
});
document.querySelectorAll("button,a").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.width = "2.4rem";
    cursor.style.height = "2.4rem";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.width = "1.1rem";
    cursor.style.height = "1.1rem";
  });
});
document.querySelector(".dots button")?.classList.add("active");
const restoreProjectRoute = () => {
  if (suppressNextRouteRestore) {
    suppressNextRouteRestore = false;
    return;
  }
  const routeMatch = location.hash.match(/^#project\/([^/]+)$/);
  if (!routeMatch) {
    if (note.classList.contains("open")) closeNote(true, false);
    return;
  }
  const routedIndex = projects.findIndex(
    (project) => projectSlug(project.title) === routeMatch[1],
  );
  if (routedIndex >= 0) {
    enterWork();
    show(routedIndex, true);
    openNote(false);
  } else {
    document.querySelector("#route-status").textContent = "Project not found. Showing the portfolio home page.";
    clearProjectRoute();
    returnHome();
  }
};
addEventListener("popstate", restoreProjectRoute);
syncInteractiveState();
restoreProjectRoute();
