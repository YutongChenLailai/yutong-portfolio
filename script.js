const MEDIA_REVISION = "9d71b30971d3864280cef28025f41ccd0d555d56";
const VALUE_MACHINE_COVER_REVISION = "bb51a916";
const media = (src) =>
  src && src.startsWith("assets/")
    ? `${src}?v=${src.startsWith("assets/projects/value-machine/cover/") ? VALUE_MACHINE_COVER_REVISION : MEDIA_REVISION.slice(0, 8)}`
    : src;
const mediaVariant = (src, width) =>
  media(src.replace(/\.webp$/i, `-${width}.webp`));
const responsiveSet = (src) =>
  `${mediaVariant(src, 480)} 480w, ${mediaVariant(src, 960)} 960w, ${media(src)} 2000w`;
const mobileCoverSource = (src) =>
  window.matchMedia("(max-width: 760px)").matches && /\/cover\/cover\.webp$/i.test(src)
    ? src.replace(/cover\.webp$/i, "cover-mobile.webp")
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
  const isThumbnail = /-thumb\.webp$/i.test(path);
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
    copy: "A cross-media VR experience that reconstructs Yao history through exploratory play, ritual space and multiple narrative paths.",
  },
  {
    title: "Value Machine",
    role: "Participatory art-market critique.",
    medium: "installation · Arduino · participation",
    image: "assets/projects/value-machine/cover/cover.webp",
    copy: "Visitors feed a fictional artist-machine, generate images and participate in their valuation, exposing how reputation manufactures artistic worth.",
  },
  {
    title: "Fetorium",
    role: "A social anatomy of stench.",
    medium: "installation · facial detection · media art",
    image: "assets/projects/fetorium/cover/cover.webp",
    copy: "Responsive puppets and facial recognition turn imagined odour into visible feedback, revealing how disgust and social boundaries are produced.",
  },
  {
    title: "Plated Fantasies",
    role: "A sensory dining fiction.",
    medium: "installation · TouchDesigner · perception",
    image: "assets/projects/plated-fantasies/cover/cover.webp",
    copy: "An interactive table stages food as a culturally conditioned image, asking when appetite belongs to the body and when it is learned.",
  },
  {
    title: "Closet X",
    role: "AI wardrobe interface.",
    medium: "UX · AI recognition · virtual try-on",
    image: "assets/projects/closet-x/cover/cover.webp",
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
    image: "assets/projects/drown-in-algae/cover/cover.webp",
    copy: "A bio-art system anchored in coastal pollution, combining environmental observation, algae-based material research and ecological repair.",
  },
];
const projectThumbnail = (src) => media(src.replace(/\.webp$/i, "-thumb.webp"));
const caseCn = [
  "一个把排泄物设为稀缺货币的推想式 VR 系统，让权力、价值与身体控制变得可感。",
  "以动态影像和空间装置重组传统吉祥符号，在熟悉与陌生之间激活文化记忆。",
  "通过 VR 游戏、叙事路径与仪式空间重新进入瑶族历史。",
  "邀请观众参与艺术生产与定价，揭示声誉如何制造价值。",
  "通过响应式木偶与面部识别，把“臭味”造成的社会边界转化成可见反馈。",
  "把餐桌变成感知实验，讨论食欲来自身体还是被训练的文化想象。",
  "连接衣物识别、个人造型、虚拟试穿与可持续管理的智能衣橱。",
  "用增强现实与分层导航连接哈尔滨历史街区、档案故事与当代行走。",
  "研究恐惧如何被环境、制度与社会传播持续喂养的实验影像。",
  "从沿海污染观察出发，以藻类材料与装置系统讨论生态修复。",
];
const projectTags = [
  ["Critical Design", "VR", "Speculative"],
  ["Culture", "Moving Image", "Installation"],
  ["Cultural Heritage", "VR", "Narrative"],
  ["Art & Value", "Installation", "Participation"],
  ["Social Behaviour", "Interactive Installation", "Technology"],
  ["Food Culture", "Installation", "Perception"],
  ["Product Design", "AI", "UX"],
  ["Cultural Heritage", "AR", "Architecture"],
  ["Moving Image", "Social Psychology"],
  ["Ecology", "Bio-art", "Installation"],
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
const forbiddenHueSketches = [
  "assets/projects/forbidden-hue/gallery/sketch-chan.webp",
  "assets/projects/forbidden-hue/gallery/sketch-wang.webp",
  "assets/projects/forbidden-hue/gallery/sketch-chu.webp",
  "assets/projects/forbidden-hue/gallery/sketch-rong.webp",
  "assets/projects/forbidden-hue/gallery/sketch-sheng.webp",
];

// Keep every project's parallel content aligned with the curated portfolio order.
const displayOrder = [0, 3, 1, 4, 5, 6, 7, 8, 9, 2];
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
  wheelLock = false,
  currentView = "home";
let overlayOpener = null;
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
  mosaic = document.querySelector("#portrait-mosaic"),
  shards = document.querySelector("#shards");
const cols = 8,
  rows = 6;
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
if (window.matchMedia("(min-width: 761px)").matches) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
    const shard = document.createElement("span"),
      img = document.createElement("img");
    shard.className = "shard";
    const seed = r * cols + c,
      x = (c - (cols - 1) / 2) * (18 + (seed % 4) * 5),
      y = (r - (rows - 1) / 2) * (13 + (seed % 5) * 4);
    const clips = [
      "polygon(5% 2%,96% 8%,91% 94%,2% 88%)",
      "polygon(12% 0,100% 13%,88% 100%,0 82%)",
      "polygon(0 9%,92% 0,100% 86%,9% 100%)",
      "polygon(7% 0,100% 6%,94% 100%,0 91%)",
    ];
    shard.style.cssText = `left:${c * (100 / cols)}%;top:${r * (100 / rows)}%;width:${100 / cols + 0.35}%;height:${100 / rows + 0.35}%;clip-path:${clips[seed % clips.length]};transform:translate(${x}px,${y}px) rotate(${((seed * 7) % 17) - 8}deg) scale(.86);transition-delay:${seed * 18}ms`;
    img.src = media("assets/site/home/portrait-bus.webp");
    img.style.width = `${cols * 100}%`;
    img.style.height = `${rows * 100}%`;
    img.style.left = `-${c * 100}%`;
    img.style.top = `-${r * 100}%`;
    shard.append(img);
      shards.append(shard);
    }
  }
}
setTimeout(() => mosaic.classList.add("assembled"), 120);
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
  wheelLock = true;
  setTimeout(() => (wheelLock = false), 900);
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
  mosaic.classList.remove("assembled");
  setTimeout(() => mosaic.classList.add("assembled"), 80);
}
document.querySelector("#enter-work").onclick = () => enterWork(true);
document.querySelector('[data-home-panel="about"]').onclick = () => {
  enterWork();
  setTimeout(() => document.querySelector('[data-open="about"]').click(), 500);
};
document.querySelector("#home-work").onclick = () => {
  enterWork();
  setTimeout(() => document.querySelector('[data-open="index"]').click(), 700);
};
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
    show(i);
    closePanels(false);
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
  closeNote(false);
  closePanels();
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
      show(i);
      closePanels(false);
      setTimeout(openNote, 300);
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
  closePanels();
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
    tagButtons(current, activeTags);
    document.querySelectorAll(".dots button").forEach((d, i) => d.classList.toggle("active", i === current));
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
document.querySelector("#note-next").onclick = () => {
  locked = false;
  next();
  setTimeout(() => {
    fillNote();
    setProjectRoute();
  }, 620);
};
document.querySelector("#note-prev").onclick = () => {
  locked = false;
  prev();
  setTimeout(() => {
    fillNote();
    setProjectRoute();
  }, 620);
};
addEventListener("keydown", (e) => {
  const isInteractive = e.target.closest?.("button,a,input,textarea,select");
  const overlayOpen = note.classList.contains("open") || document.querySelector(".panel.open");
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
addEventListener(
  "wheel",
  (e) => {
    if (note.classList.contains("open") && note.contains(e.target)) return;
    if (wheelLock || Math.abs(e.deltaY) < 12) return;
    wheelLock = true;
    if (currentView === "home" && e.deltaY > 0) enterWork();
    else if (currentView === "work") e.deltaY > 0 ? next() : prev();
    setTimeout(() => (wheelLock = false), 900);
  },
  { passive: true },
);
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
    closePanels();
    locked = false;
    show(projectIndex);
    setTimeout(openNote, 620);
  };
});
const note = document.querySelector("#project-note");
function fillNote() {
  const p = projects[current];
  note.classList.toggle(
    "poop-note",
    ["PoopSlaves", "Plantiever’s Illusion", "Value Machine"].includes(p.title),
  );
  note.classList.toggle("plantiever-note", p.title === "Plantiever’s Illusion");
  note.classList.toggle("value-note", p.title === "Value Machine");
  document.querySelector(".case-hero").style.backgroundImage = "";
  document.querySelector("#note-type").textContent = p.medium;
  document.querySelector("#note-title").textContent = p.title;
  const videos = projectVideos[current];
  document.querySelector("#case-video-links").innerHTML = videos
    .map((v, i) => `<a href="https://youtu.be/${v.id}" target="_blank" rel="noreferrer">${videos.length > 1 ? `Video ${i + 1}` : "Watch video"} · ${v.label} ↗</a>`)
    .join("");
  document.querySelector("#note-copy").textContent = p.copy;
  document.querySelector("#note-cn").textContent = caseCn[current];
  tagButtons(current, document.querySelector("#case-tags"));
  document.querySelector("#case-count").textContent =
    `${String(current + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  if (p.title === "PoopSlaves") {
    renderPoopSlaves();
    return;
  }
  const sections = ["Fetorium", "Plated Fantasies"].includes(p.title)
    ? []
    : [["01", "Final outcome", "最终成果", p.copy, caseCn[current]]];
  const detailOutcomeImages = {
    "Closet X": "assets/projects/closet-x/gallery/outcome-01.webp",
    "Navigating the Past": "assets/projects/navigating-the-past/gallery/outcome-01.webp",
    "Feeding Fear / PEEEP": "assets/projects/feeding-fear/gallery/outcome-01.webp",
    "The Forbidden Hue": "assets/projects/forbidden-hue/gallery/outcome-01.webp",
  };
  const outcomeImage = detailOutcomeImages[p.title] || p.image;
  document.querySelector("#case-sections").innerHTML = sections.map((s) => `<section class="case-section"><div class="case-label"><span>${s[0]}</span><h3>${s[1]}<small>${s[2]}</small></h3></div><div class="case-body"><div class="bilingual-pair"><p lang="en">${s[3]}</p><p class="case-cn" lang="zh">${s[4]}</p></div>${!["Plantiever’s Illusion", "Value Machine"].includes(p.title) ? `<img class="outcome-image" data-src="${outcomeImage}" alt="${p.title} final outcome" loading="lazy" decoding="async">` : ""}</div></section>`).join("");
  const container = document.querySelector("#case-sections"),
    publication = publications[current];
  let sectionNumber = sections.length + 1;
  if (p.title === "Plated Fantasies") {
    container.insertAdjacentHTML("beforeend", `<section class="case-section case-editorial-section"><div class="case-label"><span>${String(sectionNumber++).padStart(2, "0")}</span><h3>Research through interaction<small>通过交互开展研究</small></h3></div><div class="case-body case-editorial">
      <div class="bilingual-pair"><p lang="en">This project explores how repeated cultural and media representations gradually embed themselves in everyday perception, and asks why the same symbol can provoke different feelings across different relationships and social contexts — and how capitalism exploits this fluidity of association.</p><p class="case-cn" lang="zh">这个项目关注文化与媒体中反复出现的表征，如何逐渐渗入并塑造日常感知，并追问：为何同一个符号会在不同的关系与社会情境中引发不同的感受，而资本主义又是如何利用这种联想的流动性。</p></div>
      <div class="bilingual-pair"><p class="case-flow" lang="en">Media &amp; Culture → Repetition → Sensory Association → Interactive Prototype → Reinterpretation</p><p class="case-cn case-flow" lang="zh">媒体与文化 → 重复 → 感官联想 → 互动原型 → 重新诠释</p></div>
      <div class="bilingual-pair"><p lang="en">Rather than treating meaning as fixed, I use interactive prototypes to surface associations that usually go unnoticed. Through touch, sound, image, and movement, participants encounter familiar symbols in unfamiliar ways, actively reinterpreting their meanings.</p><p class="case-cn" lang="zh">我不把意义视为固定不变，而是借助互动原型，让通常不被注意的联想浮现。通过触觉、声音、影像与身体动作，参与者以陌生的方式重新遇见熟悉的符号，并主动重新诠释其意义。</p></div>
      <div class="bilingual-pair"><p lang="en">For me, the prototype is not just a final outcome but a research method — a way to expose hidden perceptions, disrupt habitual interpretations, and observe how meaning shifts through interaction.</p><p class="case-cn" lang="zh">对我而言，原型不仅是最终的设计成果，更是一种研究方法：它能显现隐藏的感知，打断习以为常的理解方式，并观察意义如何在互动中生成变化。</p></div>
    </div></section>`);
  }
  if (p.title === "Fetorium") {
    container.insertAdjacentHTML("beforeend", `<section class="case-section case-editorial-section"><div class="case-label"><span>${String(sectionNumber++).padStart(2, "0")}</span><h3>Research question &amp; insights<small>研究问题与关键发现</small></h3></div><div class="case-body case-editorial">
      <h4>Main RQ / 核心研究问题</h4>
      <div class="bilingual-pair"><p lang="en">How can an interactive system reveal how visual, embodied, and social cues shape people’s anticipation and interpretation of odor in the absence of physical smell?</p><p class="case-cn" lang="zh">互动系统如何揭示在没有真实气味时，视觉、身体与社会线索如何共同影响人们对气味的预期与解释？</p></div>
      <h4>Key Insights / 关键发现</h4>
      <ol class="case-insights">
        <li><strong>Smell can be anticipated before it is detected.</strong><span class="case-cn">视觉、语言与既有经验会使人在真正闻到气味之前，便已产生气味预期。</span></li>
        <li><strong>“Stench” can become a social label.</strong><span class="case-cn">“臭”这一感官描述，可能延伸为对身体、职业、身份乃至文化的评判。</span></li>
        <li><strong>Perception is relational.</strong><span class="case-cn">气味感知并非仅仅来自鼻子，也受到身体、空间、记忆与文化的共同影响。</span></li>
      </ol>
    </div></section>
    <section class="case-section case-editorial-section"><div class="case-label"><span>${String(sectionNumber++).padStart(2, "0")}</span><h3>Embodied atmosphere<small>具身的感官氛围</small></h3></div><div class="case-body case-editorial">
      <div class="bilingual-pair"><p lang="en">Research on atmosphere and sensory ethnography suggests that people do not experience a space through a single stimulus; perception is shaped jointly by bodily movement, spatial conditions, memory, sound, material, and social context.</p><p class="case-cn" lang="zh">关于氛围（atmosphere）与感官民族志（sensory ethnography）的研究指出，人对空间的感受并非由某一单一刺激决定，而是由身体移动、空间条件、记忆、声音、材料与社会经验共同形塑。</p></div>
      <div class="bilingual-pair"><p lang="en">This informed the design of the white-sock tunnel. Rather than asking participants to simply look at the installation, I wanted them to bend, crawl, and physically enter the space.</p><p class="case-cn" lang="zh">这一思路直接影响了白袜隧道的设计——我不希望观众只是站在外面“看”作品，而是要让他们弯腰、爬行，真正进入这个空间。</p></div>
      <div class="bilingual-pair"><p lang="en">Before participants even reach the main installation, the tunnel already reshapes their posture, distance, field of view, and sense of comfort. In this way, “stench” is presented not as a single smell but as an atmosphere gradually constructed through the body's encounter with the environment.</p><p class="case-cn" lang="zh">在抵达主装置之前，隧道已经预先改变了他们的身体姿势、观看距离、视野与舒适感。因此，“臭”并不是以单一气味的形式被呈现，而是在身体与环境的互动中逐渐建构出的一种感官氛围。</p></div>
    </div></section>`);
  }
  if (p.title === "Plantiever’s Illusion") {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="plantiever-gallery" aria-label="Plantiever’s Illusion final outcome gallery">
        <div class="plantiever-gallery-stage">
          <figure class="plantiever-gallery-peek plantiever-gallery-peek--prev"><img alt="Previous Plantiever’s Illusion outcome"></figure>
          <figure class="plantiever-gallery-main"><img alt="Plantiever’s Illusion final outcome 1 of ${plantieverOutcomeGallery.length}" loading="eager"></figure>
          <figure class="plantiever-gallery-peek plantiever-gallery-peek--next"><img alt="Next Plantiever’s Illusion outcome"></figure>
        </div>
        <footer class="plantiever-gallery-footer">
          <div class="plantiever-gallery-caption"><p>Plantiever’s Illusion — Final outcome</p><span>Image 01 / ${String(plantieverOutcomeGallery.length).padStart(2, "0")}</span></div>
          <div class="plantiever-gallery-controls">
            <button type="button" data-plantiever-direction="-1" aria-label="Previous image">‹</button>
            <button type="button" data-plantiever-direction="1" aria-label="Next image">›</button>
          </div>
        </footer>
      </section>`,
    );
    let galleryIndex = 0;
    const gallery = container.querySelector(".plantiever-gallery");
    const galleryMain = gallery.querySelector(".plantiever-gallery-main img");
    const galleryPrevious = gallery.querySelector(".plantiever-gallery-peek--prev img");
    const galleryNext = gallery.querySelector(".plantiever-gallery-peek--next img");
    const galleryCounter = gallery.querySelector(".plantiever-gallery-caption span");
    const renderGallery = async () => {
      const previousIndex = (galleryIndex - 1 + plantieverOutcomeGallery.length) % plantieverOutcomeGallery.length;
      const nextIndex = (galleryIndex + 1) % plantieverOutcomeGallery.length;
      await Promise.all([
        swapResponsiveImage(galleryMain, plantieverOutcomeGallery[galleryIndex], "70vw"),
        swapResponsiveImage(galleryPrevious, plantieverOutcomeGallery[previousIndex], "25vw"),
        swapResponsiveImage(galleryNext, plantieverOutcomeGallery[nextIndex], "25vw"),
      ]);
      galleryMain.alt = `Plantiever’s Illusion final outcome ${galleryIndex + 1} of ${plantieverOutcomeGallery.length}`;
      galleryPrevious.alt = `Previous outcome ${previousIndex + 1}`;
      galleryNext.alt = `Next outcome ${nextIndex + 1}`;
      galleryCounter.textContent = `Image ${String(galleryIndex + 1).padStart(2, "0")} / ${String(plantieverOutcomeGallery.length).padStart(2, "0")}`;
      preloadResponsiveImage(plantieverOutcomeGallery[nextIndex], "70vw");
      preloadResponsiveImage(plantieverOutcomeGallery[previousIndex], "70vw");
    };
    gallery.querySelectorAll("[data-plantiever-direction]").forEach((button) => {
      button.onclick = async () => {
        galleryIndex = (galleryIndex + Number(button.dataset.plantieverDirection) + plantieverOutcomeGallery.length) % plantieverOutcomeGallery.length;
        gallery.classList.add("is-changing");
        await renderGallery();
        gallery.classList.remove("is-changing");
      };
    });
    let galleryPointerStart = null;
    gallery.querySelector(".plantiever-gallery-stage").addEventListener("pointerdown", (event) => {
      galleryPointerStart = event.clientX;
    });
    gallery.querySelector(".plantiever-gallery-stage").addEventListener("pointerup", (event) => {
      if (galleryPointerStart === null || Math.abs(event.clientX - galleryPointerStart) < 45) return;
      const direction = event.clientX < galleryPointerStart ? 1 : -1;
      gallery.querySelector(`[data-plantiever-direction="${direction}"]`).click();
      galleryPointerStart = null;
    });
    renderGallery();
    sectionNumber += 1;
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
              <button class="poop-paper-arrow" type="button" aria-label="Show C&amp;C presentation documentation"><span>›</span></button>
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
            <button type="button" data-value-direction="-1" aria-label="Previous image">‹</button>
            <button type="button" data-value-direction="1" aria-label="Next image">›</button>
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
    sectionNumber += 1;
  }
  if (p.title === "The Forbidden Hue") {
    container.insertAdjacentHTML(
      "beforeend",
      `<section class="portfolio-series forbidden-sketch-series"><header><span>${String(sectionNumber).padStart(2, "0")}</span><div><h3>Award-Winning Psychological Art Sketches</h3><p>First Prize selection · Original drawings</p></div><small>Drag or scroll horizontally / 左右滑动</small></header><div class="portfolio-rail">${forbiddenHueSketches.map((src, i) => `<figure><img data-src="${src}" alt="The Forbidden Hue award-winning psychological art sketch ${i + 1}" loading="lazy"><figcaption>${String(i + 1).padStart(2, "0")} / ${String(forbiddenHueSketches.length).padStart(2, "0")}</figcaption></figure>`).join("")}</div></section>`,
    );
    sectionNumber += 1;
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
        <button class="poop-rca-arrow poop-rca-arrow--prev" data-poop-direction="-1" aria-label="Previous outcome"><span>‹</span></button>
        <figure class="poop-rca-slide" aria-live="polite">
          <img src="${outcomes[0].image}" alt="PoopSlaves final outcome 1 of ${outcomes.length}" loading="eager">
          <figcaption>
            <p class="poop-rca-kicker">FINAL OUTCOME <span>01 / ${String(outcomes.length).padStart(2, "0")}</span></p>
            <h4>${outcomes[0].title}</h4>
            <p class="poop-rca-copy">${outcomes[0].copy}</p>
            <p class="case-cn poop-rca-cn">${outcomes[0].cn}</p>
          </figcaption>
        </figure>
        <button class="poop-rca-arrow poop-rca-arrow--next" data-poop-direction="1" aria-label="Next outcome"><span>›</span></button>
        <div class="poop-rca-mobile-controls" aria-label="Outcome gallery controls">
          <button data-poop-direction="-1" aria-label="Previous outcome"><span>‹</span></button>
          <button data-poop-direction="1" aria-label="Next outcome"><span>›</span></button>
        </div>
      </div>
    </section>
    <section class="poop-research">
      <header><span>02</span><div><h3>Research & Conference Presentations</h3><p>论文与会议展示</p></div></header>
      <div class="bilingual-pair"><p class="poop-method" lang="en">Successive VR prototypes tested how unequal rules, delayed feedback and constrained movement could make bodily commodification felt rather than merely described.</p><p class="case-cn" lang="zh">通过多轮 VR 原型，测试不平等规则、延迟反馈与受限行动如何让身体商品化成为可感的体验，而不只是文字描述。</p></div>
      <div class="poop-paper-grid">
        <article><img data-src="assets/projects/poopslaves/research/hcii-poster.webp" alt="HCII poster for Visceral Interaction" loading="lazy"><div class="poop-paper-copy"><h4>HCII 2026 · Late Breaking Work</h4><p>Visceral Interaction: Operationalizing Cognitive Friction through Rule-Based VR Economic Simulation</p><a href="https://scholar.google.com/scholar?q=Visceral+Interaction+Operationalizing+Cognitive+Friction+through+Rule-Based+VR+Economic+Simulation" target="_blank" rel="noreferrer">Paper record / 论文链接 ↗</a></div></article>
        <article class="poop-paper-card--cc">
          <div class="poop-paper-media">
            <img class="poop-paper-media-image is-active" data-src="assets/projects/poopslaves/research/creativity-cognition-poster.webp" alt="Creativity and Cognition poster for Excremental Economy" loading="lazy" decoding="async">
            <img class="poop-paper-media-image" data-src="assets/projects/poopslaves/research/creativity-cognition-photo.webp" alt="PoopSlaves poster presented at Creativity and Cognition" loading="lazy" decoding="async">
            <span class="poop-paper-count">01 / 02</span>
            <button class="poop-paper-arrow" type="button" aria-label="Show C&amp;C presentation documentation"><span>›</span></button>
          </div>
          <div class="poop-paper-copy"><h4>ACM Creativity & Cognition 2026</h4><p>Excremental Economy: A Rule-Based Speculative System for Staging Bodily Commodification and Unequal Value Extraction</p><a href="https://scholar.google.com/citations?view_op=view_citation&hl=en&user=yYgrzP8AAAAJ&citation_for_view=yYgrzP8AAAAJ:u-x6o8ySG0sC" target="_blank" rel="noreferrer">Google Scholar / 查看论文 ↗</a></div>
        </article>
      </div>
    </section>
    <section class="poop-graduation">
      <header><span>03</span><div><h3>HIT Outstanding Graduation Project</h3><p>哈尔滨工业大学优秀毕业设计</p></div></header>
      <div class="bilingual-pair"><p class="poop-graduation-lead" lang="en">PoopSlaves was presented as Yutong Chen's undergraduate graduation project at Harbin Institute of Technology and received recognition as an Outstanding Graduation Project.</p><p class="case-cn" lang="zh">PoopSlaves 作为陈宇同在哈尔滨工业大学的本科毕业设计进行展出，并获评优秀毕业设计。</p></div>
      <div class="poop-honour-grid">
        <figure><img data-src="assets/projects/poopslaves/research/graduation-display.webp" alt="PoopSlaves undergraduate graduation exhibition display" loading="lazy"><figcaption>Graduation exhibition / 本科毕业设计陈列</figcaption></figure>
        <figure><img data-src="assets/projects/poopslaves/research/graduation-documentation.webp" alt="Graduation exhibition documentation" loading="lazy"><figcaption>Exhibition documentation / 毕设展现场记录</figcaption></figure>
        <figure><img data-src="assets/projects/poopslaves/research/graduation-certificate.webp" alt="Outstanding Graduation Project certificate" loading="lazy"><figcaption>Outstanding Graduation Project certificate / 优秀毕业设计证书</figcaption></figure>
      </div>
    </section>
    <section class="portfolio-series"><header><span>04</span><div><h3>MA Application Portfolio Series</h3><p>硕士申请作品集系列套图 · Original full-resolution spreads</p></div><small>Drag or scroll horizontally / 左右滑动</small></header><div class="portfolio-rail">${poopPortfolioSeries.map((src, i) => `<figure><img data-src="${src}" alt="PoopSlaves MA application portfolio spread ${i + 1}" loading="lazy"><figcaption>${String(i + 1).padStart(2, "0")} / ${String(poopPortfolioSeries.length).padStart(2, "0")}</figcaption></figure>`).join("")}</div></section>`;
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
const setProjectRoute = (index = current) => {
  const url = new URL(location.href);
  url.hash = `project/${projectSlug(projects[index].title)}`;
  history.replaceState({ project: index }, "", url);
};
const clearProjectRoute = () => {
  if (!location.hash.startsWith("#project/")) return;
  history.replaceState({}, "", `${location.pathname}${location.search}`);
};
function openNote(updateRoute = true) {
  if (!note.classList.contains("open")) overlayOpener = document.activeElement;
  document.body.classList.add("detail-open");
  note.classList.add("open");
  note.setAttribute("aria-hidden", "false");
  note.scrollTo(0, 0);
  fillNote();
  registerMedia(note);
  syncInteractiveState();
  document.querySelector("#close-note").focus();
  document.title = `${projects[current].title} — Yutong Chen`;
  document.querySelector('meta[name="description"]').content = projects[current].copy;
  if (updateRoute) setProjectRoute();
}
function closeNote(restore = true, updateRoute = true) {
  note.classList.remove("open");
  document.body.classList.remove("detail-open");
  note.setAttribute("aria-hidden", "true");
  document.title = "Yutong Chen — Portfolio";
  document.querySelector('meta[name="description"]').content = "Yutong Chen is an HCI researcher and creative technologist exploring creativity and cognition, human–AI interaction, embodied interaction and generative systems.";
  syncInteractiveState();
  if (restore && overlayOpener?.isConnected) overlayOpener.focus();
  if (updateRoute) clearProjectRoute();
  if (restore && returnCategory)
    setTimeout(() => openCategory(returnCategory), 250);
}
document.querySelector("#read-project").onclick = openNote;
document.querySelector("#close-note").onclick = closeNote;
const cursor = document.querySelector(".cursor");
addEventListener("pointermove", (e) => {
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
  const px = e.clientX / innerWidth - 0.5,
    py = e.clientY / innerHeight - 0.5;
  if (currentView === "home") {
    mosaic.style.transform = `translate(${px * 15}px,${py * 12}px) rotateY(${px * 3}deg)`;
    document
      .querySelectorAll(".shard")
      .forEach(
        (s, i) =>
          (s.style.margin = `${py * ((i % rows) - 2.5) * 1.2}px 0 0 ${px * ((i % cols) - 3.5) * 1.2}px`),
      );
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
  const routeMatch = location.hash.match(/^#project\/([^/]+)$/);
  if (!routeMatch) {
    if (note.classList.contains("open")) closeNote(false, false);
    return;
  }
  const routedIndex = projects.findIndex(
    (project) => projectSlug(project.title) === routeMatch[1],
  );
  if (routedIndex >= 0) {
    enterWork();
    locked = false;
    show(routedIndex);
    setTimeout(() => openNote(false), 700);
  } else {
    document.querySelector("#route-status").textContent = "Project not found. Showing the portfolio home page.";
    clearProjectRoute();
    returnHome();
  }
};
addEventListener("hashchange", restoreProjectRoute);
syncInteractiveState();
restoreProjectRoute();
